/* global
MIRI_EVENTS

Miri
SettingStorage
log
debug

renderRuby
setRubyVisibility
updateRubySizeStyle
updateRubyColorStyle
updateSelectStyle
*/

const onTokenReady = (c, t) => {
  renderRuby(c, t);
};

SettingStorage.on('updated', (settings) => {
  const {
    enabled,
    pct,
    furigana_selectable,
    color
  } = settings;
  setRubyVisibility('miri-ruby-visible', enabled);
  updateRubySizeStyle('miri-ruby', pct);
  updateRubyColorStyle('miri-ruby-color', color);
  updateSelectStyle('miri-furigana-select', furigana_selectable);
});

const miri = new Miri({
  onTokenReady,
});

const registerMutationHook = () => {
  const MAIN_CONTAINER_SELECTOR = '#react-root';
  const TL_CONTAINER_SELECTOR = 'section>div>div>div';
  const TWEET_ARTICLE_SELECTOR = 'article div[lang=ja]';

  const mainContainer = document.querySelector(MAIN_CONTAINER_SELECTOR);

  if (!mainContainer) {
    log('not found main container element.');
    return false;
  }

  const observer = new MutationObserver((mutationsList) => {
    const tlContainer = document.querySelector(TL_CONTAINER_SELECTOR);
    if (!tlContainer) {
      // timeline container should be rendered
      return;
    }

    const tweetBag = [];
    mutationsList.forEach((mutation) => {
      const { addedNodes } = mutation;

      if (!addedNodes.length) {
        // ignore the non-add events
        return;
      }

      if (
        addedNodes.length === 1 && (
          addedNodes[0].nodeType === 3 ||
          addedNodes[0].tagName === "RUBY"
        )
      ) {
        // ignore kana updates
        return;
      }

      addedNodes.forEach((node) => {
        if (node.nodeType !== 1) {
          // node type should be element(1)
          return;
        }

        const articles = node.querySelectorAll(TWEET_ARTICLE_SELECTOR);
        articles.forEach((article) => {
          [...article.children].forEach((c) => {
            if (c.childElementCount) {
              // contaniner should only has text node
              return;
            }

            if (c.tagName === 'IMG') {
              // the data-emoji-text will cause the bug that
              // chrome copy the hidden ruby text unexpectly
              // this is a workaround, may cause some issue
              // on accessibility
              if (c.dataset.emojiText) {
                c.removeAttribute('data-emoji-text');
              }
            }

            if (c.tagName !== 'SPAN') {
              // child should has span sub-child
              return;
            }

            if (!c.childNodes.length || c.childNodes.nodeType === 3) {
              // sub-child should has text node(3)
              return;
            }

            const { textContent } = c.childNodes[0];
            if (!textContent.trim().length) {
              // text content should not empty
              return;
            }

            // Twitter bug 2020-08-17 ?
            // sometimes twitter will update same element twice with unknown rease
            // unique the result to prevent appending duplicate ruby
            const duplicated = tweetBag.some((t) => t.c === c && t.tc === textContent);
            if (duplicated) {
              return;
            }

            tweetBag.push({
              c,
              tc: textContent,
            });
          });
        });
      });
    });

    if (tweetBag.length) {
      miri.addTweets(tweetBag);
    }
  });

  observer.observe(mainContainer, { childList: true, subtree: true });
  return true;
};

const registerDeckMutationHook = () => {
  const MAIN_CONTAINER_SELECTOR = 'body>div.application';
  const COLUMN_CONTAINER_SELECTOR = 'div.column-scroller';
  const TWEET_ARTICLE_SELECTOR = 'p.tweet-text[lang=ja]';

  const mainContainer = document.querySelector(MAIN_CONTAINER_SELECTOR);

  if (!mainContainer) {
    log('not found main container element.');
    return false;
  }

  const observer = new MutationObserver((mutationsList) => {
    const columnContainer = document.querySelector(COLUMN_CONTAINER_SELECTOR);
    if (!columnContainer) {
      // column container should be rendered
      return;
    }

    const tweetBag = [];
    mutationsList.forEach((mutation) => {
      const { addedNodes } = mutation;

      if (!addedNodes.length) {
        // ignore the non-add events
        return;
      }

      if (
        addedNodes.length === 1 && (
          addedNodes[0].nodeType === 3 ||
          addedNodes[0].tagName === "RUBY" ||
          addedNodes[0].tagName === "SPAN"
        )
      ) {
        // ignore kana updates
        return;
      }

      addedNodes.forEach((node) => {
        if (node.nodeType !== 1) {
          // node type should be element(1)
          return;
        }

        const articles = node.querySelectorAll(TWEET_ARTICLE_SELECTOR);
        articles.forEach((article) => {
          [...article.childNodes].forEach((c) => {
            if (c.nodeType !== 3) {
              // only get text node(3)
              return
            }

            const { textContent } = c;
            if (!textContent.trim().length) {
              // text content should not empty
              return;
            }

            const textSpan = document.createElement("span");
            article.replaceChild(textSpan, c);
            tweetBag.push({
              c: textSpan,
              tc: textContent,
            });
          });
        });
      });
    });

    if (tweetBag.length) {
      miri.addTweets(tweetBag);
    }
  });

  observer.observe(mainContainer, { childList: true, subtree: true });
  return true;
};


test_mainComponents = {
  'ja.wikipedia.org': 'body > div.mw-page-container',
  'www.youtube.com': 'body > ytd-app',
}

test_selectorQueries = {
  'ja.wikipedia.org': 'P',
  'www.youtube.com': '#content.style-scope.ytd-expander',
}

const registerGeneralMutationHook = () => {
  const loc = window.location;
  const site = loc.port === '' ? loc.host : loc.hostname;

  if (!SelectorStorage.has_selector(site)) {
    return false;
  }

  const componentQuery = SelectorStorage.selectors.get(site)['component'];
  const mainContainer = document.body.querySelector(componentQuery);
  
  if (!mainContainer) {
    log('not found main container element.');
    return false;
  }

  const findElements = (mutationsList) => {
    const elementBag = [];
    mutationsList.forEach((mutation) => {
      const { addedNodes } = mutation;

      if (!addedNodes.length) {
        // ignore the non-add events
        return;
      }

      addedNodes.forEach((node) => {
        while (node.nodeType === 3) {
          // a selector will be not a text node and we choose the grandparent node
          // because the parent might be the node we are looking for
          // TODO: it might be necessary to pick the first child of the container which contains the node
          node = node.parentNode.parentNode
        }

        if (node.nodeType !== 1) {
          // node type should be element(1)
          return;
        }
        
        const queries = SelectorStorage.selectors.get(site)['queries']

        queries.forEach((query) => {
          const elements = node.querySelectorAll(query);
          
          elements.forEach((element) => {
            if (elementBag.includes(element)) return;
            if (element.innerHTML.includes('class="furigana"')) return; // TODO: check this
            
            const textContent = element.innerText;
            if (!textContent.trim().length) {
              // text content should not empty
              return;
            }

            //const textSpan = document.createElement("span");
            //element.parentNode.replaceChild(textSpan, element);

            elementBag.push(element);
          });
        });
      });
    });

    if (elementBag.length) {
      const bag = []
      elementBag.forEach( (e) => { 
        bag.push({
          c: e,
          tc: e.textContent,
        });
      });
      miri.addTweets(bag); // TODO: might need be changed to generalized version
    }
  };

  const observer = new MutationObserver(findElements);

  observer.observe(mainContainer, { childList: true, subtree: true });
  findElements([{addedNodes: [mainContainer]}]); // run once on mainContainer

  SelectorStorage.on('updated', () => {
    const loc = window.location;
    const site = loc.port === '' ? loc.host : loc.hostname;
    const componentQuery = SelectorStorage.selectors.get(site)['component'];
    const mainContainer = document.body.querySelector(componentQuery);
    findElements([{addedNodes: [mainContainer]}]); // run once on mainContainer
  });
  return true;
};

// main
log('initialized.');

var hooked = false;
hooked = registerMutationHook();
hooked = hooked || registerDeckMutationHook();

if (!hooked) {
  SelectorStorage.on('loaded', () => {
    hooked = hooked || registerGeneralMutationHook();

    SelectorStorage.on('updated', () => {
      if (!hooked) {
        hooked = registerGeneralMutationHook();
      }
    });
  });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event, value } = request;
  if (event === MIRI_EVENTS.TOGGLE_EXTENSION) {
    setRubyVisibility('miri-ruby-visible', value);
    SettingStorage.set({ enabled: value });
  } else if (event === MIRI_EVENTS.UPDATE_FURIGANA_SIZE) {
    updateRubySizeStyle('miri-ruby', value);
    SettingStorage.set({ pct: value });
  } else if (event === MIRI_EVENTS.UPDATE_FURIGANA_COLOR) {
    updateRubyColorStyle('miri-ruby-color', value);
    SettingStorage.set({ color: value });
  } else if (event === MIRI_EVENTS.UPDATE_FURIGANA_SELECTABLE) {
    updateSelectStyle('miri-furigana-select', value);
    SettingStorage.set({ furigana_selectable: value });
  }
});
