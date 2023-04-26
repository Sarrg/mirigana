/* eslint no-unused-vars: 0 */
/* global

MIRI_EVENTS

SettingStorage
*/

window.__mirigana__ = (window.__mirigana__ || {}); // eslint-disable-line no-underscore-dangle

const isFirefox = () => (typeof InstallTrigger !== 'undefined');
const isChrome = () => (!!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime));

const getKanaTag = (tag) => `<img alt="${tag}" src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"></svg>' />`;
const renderKana = (furigana) => document.createTextNode(furigana);

const kanaConvert = (kana, isHiraToKata) => {
  if (isHiraToKata && !/[ぁ-ん]/.test(kana)) {
    return kana;
  }
  if (!isHiraToKata && !/[ァ-ン]/.test(kana)) {
    return kana;
  }
  const MAGIC = isHiraToKata ? 96 : -96;
  return String.fromCharCode(kana.charCodeAt(0) + MAGIC);
};

const hira2kata = (str) => str.split('').map((c) => kanaConvert(c, true)).join('');

const kata2hira = (str) => str.split('').map((c) => kanaConvert(c, false)).join('');

const sameKana = (kana1, kana2) => hira2kata(kana1) === hira2kata(kana2);

const countSameChar = (arr, char) => arr.reduce((a, b) => {
  if (b === char) {
    a += 1;
  }
  return a;
}, 0);

// smash the token into the substring which not mixed kanji and kana
const smash = (tkn) => {
  // prepare the data structure
  const surfaceGroup = [...tkn.s].reduce((group, curr, idx) => {
    const isKanji = (/[一-龯々]/).test(curr);
    if (idx === 0 || !isKanji || isKanji !== group.lastIsKanji) {
      group.push({
        s: curr,
        isKanji,
        r: [],
        p: tkn.p + idx,
      });
    } else {
      // should merge
      const last = group[group.length - 1];
      last.s = `${last.s}${curr}`;
    }

    group.lastIsKanji = isKanji;
    return group;
  }, []);

  // attach reading
  const readArray = [...tkn.r];
  surfaceGroup.forEach((s, idx) => {
    const next = surfaceGroup[idx + 1];
    for (let i = 0, len = readArray.length; i < len; i += 1) {
      const curr = readArray[0];
      const currIsSingle = (countSameChar(readArray, curr) === 1);

      if (
        s.r.length
        && next
        && sameKana(next.s, curr)
        && currIsSingle) {
        // matched the first kana
        // dont break when there are same curr in the readArray
        // break then try the next char in the surface form
        break;
      }

      // move the current kana to the reading
      s.r.push(curr);
      readArray.shift();

      if (!s.isKanji) {
        // current char of the surface form is not a kanji
        // break because the kana can only be matched one by one
        break;
      }
    }
  });

  return surfaceGroup
    .filter((sg) => sg.isKanji)
    .map((sg) => ({
      s: sg.s,
      r: sg.r.join(''),
      p: sg.p,
      c: tkn.s+'='+tkn.r, // original context
    }));
};

// inject the css file into the head element
const updateStyleNode = (id, content) => {
  const head = document.querySelector('head');
  const oldNode = document.querySelector(`#${id}`);

  const cssNode = oldNode || document.createElement('style');
  cssNode.textContent = content;

  if (!oldNode) {
    cssNode.id = id;
    head.appendChild(cssNode);
  }
};

const setRubyVisibility = (id, visible) => {
  updateStyleNode(id, `
rt.furigana {
  ${visible ? '' : 'display: none;'}
}
`);
};

const updateRubySizeStyle = (id, pct) => {
  updateStyleNode(id, `
rt.furigana {
  font-size: ${pct}%;
}`);
};

const updateRubyColorStyle = (id, color) => {
  updateStyleNode(id, `
rt.furigana {
  color: ${color};
}`);
};

const updateSelectStyle = (id, furigana_selectable) => {
  updateStyleNode(id, `
rt.furigana {
  user-select: ${furigana_selectable ? 'text' : 'none'};
}`);
};

const renderKanji = (kana, kanji, context) => {
  const el = document.createElement('ruby');
  const kanaStart = getKanaTag('(');
  const kanaEnd = getKanaTag(')');

  el.innerHTML = `${kanji}<rt class="furigana">${kanaStart}${kana}${kanaEnd}</rt>`;
  el.setAttribute('ctx', context)

  el.addEventListener(
    'pointerdown',
    (e)=> {
      if (document.getSelection().isCollapsed) {
        const ctx = e.target.getAttribute('ctx')
        if(FilterStorage.filter_exists(ctx)) {
          FilterStorage.delete(ctx);
        }
        else {
          FilterStorage.add(ctx);
        }
      }
    },
    false
  );
  return el;
};

const renderRuby = (container, token) => {
  const text = container.innerText;

  // smash the token to the kanji-only token
  const smashed = token.reduce((ret, tkn) => ret.concat(smash(tkn)), []);

  // create blocks from smashed token
  let pos = 0;
  const blocks = [];
  smashed.forEach((r) => {
    if (r.p !== pos) {
      blocks.push({
        s: text.substr(pos, r.p - pos),
      });
      pos = r.p;
    }
    blocks.push({
      s: r.s,
      r: r.r,
      c: r.c,
    });
    pos += r.s.length;
  });

  if (text.length > pos) {
    blocks.push({
      s: text.substr(pos),
    });
  }

  // clear the original text
  container.innerText = '';
  blocks.forEach((b) => {
    if (b.r) {
      // contains kanji
      const rb = renderKanji(b.r, b.s, b.c);
      container.appendChild(rb);
      const filter_furigana = FilterStorage.filter_exists(b.c);
      if (filter_furigana) {
        rb.querySelector('.furigana').style.display = 'none';
      }
      
    } else {
      // all kana or unparsed kanji
      container.appendChild(renderKana(b.s));
    }
  });
};

if (isChrome()) {
  FilterStorage.on('updated', (event, filter) => {
    const selector_query = `ruby[ctx="${filter}"] .furigana`;
    document.querySelectorAll(selector_query).forEach((rb) => {
      rb.style.display = (event === MIRI_EVENTS.FILTER_ADDED) ? 'none' : '';
    });
  });
}

if (isFirefox()) {
  updateStyleNode('miri-ruby-align', `
ruby {
  ruby-align: space-between;
}`);
}
