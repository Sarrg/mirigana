/* eslint no-unused-vars: 0 */
/* global

SettingStorage
*/

const oninit = [];

(async () => {
  var src = chrome.runtime.getURL("constants.js");
  const consts = await import(src);
  window.MIRI_EVENTS = consts.MIRI_EVENTS
  
  // TODO: release message that background is loaded
  oninit.forEach(func => func());
})();

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
    let isKanji = (/[一-龯々]/).test(curr);
    let isNumber = (/[0-9]/).test(curr);
    let hasFurigana = isKanji || isNumber
    if (idx === 0 || !hasFurigana || hasFurigana !== group.lastHasFurigana) {
      group.push({
        s: curr,
        hasFurigana,
        r: [],
        p: tkn.p + idx,
      });
    } else {
      // should merge
      const last = group[group.length - 1];
      last.s = `${last.s}${curr}`;
    }

    group.lastHasFurigana = hasFurigana;
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

      if (!s.hasFurigana) {
        // current char of the surface form is not a kanji
        // break because the kana can only be matched one by one
        break;
      }
    }
  });

  return surfaceGroup
    .filter((sg) => sg.hasFurigana)
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
    'click',
    (e)=> {
      if (document.getSelection().isCollapsed && e.altKey) {
        const ctx = e.target.getAttribute('ctx')

        FilterStorage.has(ctx).then( (exists) => {
          if(exists) {
            FilterStorage.delete(ctx);
          }
          else {
            FilterStorage.add(ctx);
          }
        });
        
        // prevent other actions to be triggered
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true
  );
  return el;
};

const renderRuby = (container, token) => {
  if (token.length === 0) return;

  const text = container.textContent;

  // smash the token to the kanji-only token
  const smashed = token.reduce((ret, tkn) => ret.concat(smash(tkn)), []);

  // get all text nodes
  const textNodes = []
  const getTextNodes = function getTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
      return;
    }
    node.childNodes.forEach((cnode) => getTextNodes(cnode));
  }
  
  getTextNodes(container);

  // create blocks from smashed token per text node
  let pos = 0;
  let tnPos = 0;
  let tnIdx = 0;
  const nodeBlocks = {};
  let blocks = [];
  smashed.forEach((r) => {
    while (r.p !== pos) {
      const tnText = textNodes[tnIdx].textContent
      const tnSub = tnText.substr(pos - tnPos)
      if (tnSub.includes(r.s)) {
        blocks.push({
          s: text.substr(pos, r.p - pos),
        });
        pos = r.p;
      }
      else {
        if (blocks.length) {
          nodeBlocks[tnIdx] = blocks;
        }
        pos = tnPos + tnText.length;
        blocks = [];
        tnIdx++;
        tnPos = pos;
      }
    }
    blocks.push({
      s: r.s,
      r: r.r,
      c: r.c,
    });
    pos += r.s.length;
  });

  if (blocks.length) {
    const tnText = textNodes[tnIdx].textContent
    const tnEnd = tnPos + tnText.length
    if (tnEnd > pos) {
      blocks.push({
        s: tnText.substr(pos - tnPos),
      });
    }
    nodeBlocks[tnIdx] = blocks;
  }
  
  // replace the original text nodes
  for (const key in nodeBlocks){
    const textNode = textNodes[key];
    let textNodeText = textNode.textContent;
    const blocks = nodeBlocks[key];
    const textSpan = document.createElement("span");

    blocks.forEach((b) => {
      if (b.r) {
        // contains kanji
        const rb = renderKanji(b.r, b.s, b.c);
        textSpan.appendChild(rb);
        //const filter_furigana = FilterStorage.has(b.c);
        //if (filter_furigana) {
        //  rb.querySelector('.furigana').style.display = 'none';
        //}
      } else {
        //all kana or unparsed kanji
        textSpan.appendChild(renderKana(b.s));
      }
      textNodeText = textNodeText.substring(b.s.length);
    });
    textNode.parentNode.replaceChild(textSpan, textNode);
  }

  // TODO: move this, should be triggered when mutations are all handled
  const contexts = [... new Set(blocks.filter(b => b.c).map(b => b.c ))];
  FilterStorage.has(contexts).then( (hasFilter) => {
    for (let [i, c] of contexts.entries()) {
      if (hasFilter[i]) {
        const selector_query = `ruby[ctx="${c}"] .furigana`;
        document.querySelectorAll(selector_query).forEach((rb) => {
          rb.style.display = 'none';
        });
      }
    }
  });
};


oninit.push(() => {
  if (isChrome()) {
    chrome.runtime.onMessage.addListener((message) => {
      const {event} = message;

      if (event !== MIRI_EVENTS.FILTER_ADDED && event !== MIRI_EVENTS.FILTER_DELETED) {
        return false;
      }
      const {filter} = message;
      const added = event === MIRI_EVENTS.FILTER_ADDED;
      const selector_query = `ruby[ctx="${filter}"] .furigana`;
      document.querySelectorAll(selector_query).forEach((rb) => {
        rb.style.display = added ? 'none' : '';
      });

      return true;

    });

    // FilterStorage.on('updated', (event, filter) => {
    //   const selector_query = `ruby[ctx="${filter}"] .furigana`;
    //   document.querySelectorAll(selector_query).forEach((rb) => {
    //     rb.style.display = (event === MIRI_EVENTS.FILTER_ADDED) ? 'none' : '';
    //   });
    // });
  }
});