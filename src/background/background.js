/* global
kuromoji
EXTENSION_ENABLED_KEY
EXTENSION_ENABLED_DEFAULT
FURIGANA_SIZE_PERCENTAGE_KEY
FURIGANA_SIZE_PERCENTAGE_DEFAULT
FURIGANA_COLOR_KEY
FURIGANA_COLOR_DEFAULT
FURIGANA_SELECTABLE_KEY
FURIGANA_SELECTABLE_DEFAULT
CURRENT_PARSE_ENGINE_KEY
CURRENT_PARSE_ENGINE_DEFAULT

MIRI_EVENTS
PARSE_ENGINES

rebulidToken
retrieveFromCache
persiseToCache
*/

function listenTokenParseMessage(callback) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { event, tweets } = request;
    if (event !== MIRI_EVENTS.REQUEST_TOKEN) {
      return false;
    }

    callback(tweets, sendResponse);
    return true;
  });
}

// init engine
chrome.storage.local.get((result = {}) => {
  const currentEngineKey = result[CURRENT_PARSE_ENGINE_KEY] || CURRENT_PARSE_ENGINE_DEFAULT;
  if (currentEngineKey === PARSE_ENGINES[0].key) {
    // local
    kuromoji.builder({ dicPath: 'data/' }).build().then((tokenizer) => {
      listenTokenParseMessage((tweets, sendResponse) => {
        const results = tweets.map((t) => {
          const token = tokenizer.tokenize(t);
          const ret = rebulidToken(token);
          return ret;
        });
        sendResponse(results);
      });
    });
  } else if (currentEngineKey === PARSE_ENGINES[1].key) {
    // remote
    listenTokenParseMessage((tweets, sendResponse) => {
      const { cacheArray, requestArray } = retrieveFromCache(tweets);
      const postBody = JSON.stringify(requestArray);

      if (!requestArray.length) {
        // all tweets in cache, return immedately
        sendResponse(cacheArray);
        return;
      }

      fetch('https://api.mirigana.app/nlp', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postBody,
      }).then((res) => res.json())
        .then((tokens) => {
          // compose the complete token array
          const results = cacheArray.map((ca, idx) => {
            if (ca !== undefined) {
              return ca;
            }

            // persist to cache
            const k = tweets[idx];
            const v = tokens.shift();
            persiseToCache(k, v);

            return (v);
          });

          // console.log('completed:', results);
          sendResponse(results);
        })
        .catch((error) => {
          sendResponse(null);
        });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event } = request;
  if (event !== MIRI_EVENTS.LOAD_SETTINGS) {
    // reject other events
    return false;
  }


  // TODO this function is duplicated with popup.js
  function nullish(value, defaultValue) {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return value;
  }

  chrome.storage.sync.get((result = {}) => {
    sendResponse({
      enabled: nullish(result[EXTENSION_ENABLED_KEY], EXTENSION_ENABLED_DEFAULT),
      pct: nullish(result[FURIGANA_SIZE_PERCENTAGE_KEY], FURIGANA_SIZE_PERCENTAGE_DEFAULT),
      color: nullish(result[FURIGANA_COLOR_KEY], FURIGANA_COLOR_DEFAULT),
      furigana_selectable: nullish(result[FURIGANA_SELECTABLE_KEY], FURIGANA_SELECTABLE_DEFAULT),
    });
  });

  // indicate async callback
  return true;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event } = request;
  if (event !== MIRI_EVENTS.LOAD_EXTENSION_INFO) {
    // reject other events
    return false;
  }

  chrome.management.getSelf((info) => {
    sendResponse({ info });
  });

  // indicate async callback
  return true;
});

// disable page action icon for the site other than twitter.com
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId).then((tab) => {
    if (tab.url.match(/^https:\/\/(tweetdeck.)?twitter\.com\//)) {
      chrome.action.enable();
    } else {
      chrome.action.disable();
    }
  })
});
