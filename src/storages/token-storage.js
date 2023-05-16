/* global
MIRI_EVENTS

debug
*/

// eslint-disable-next-line no-unused-vars

import {MIRI_EVENTS, STORAGE_KEYS} from '../constants.js';

export const TokenStorage = {
    tokens: new Map(),
    sessionTokens: new Map(),
    loaded: false,
  
    eventHandlers: {
      loaded: [],
      updated: [],
    },
  
    on(eventName, func) {
      // loaded
      // updated
      this.eventHandlers[eventName].push(func);
  
      if (eventName === 'loaded' && this.loaded) {
        // emit loaded event immedately if the tokens are already loaded
        func(this.tokens);
      }
    },
  
    load() {

      // const onLoad = (response) => {
      //   //debug('responsed: LOAD_FILTERS');
      //   this.loaded = true;
      //   this.tokens = new Map(response.tokens);
      //   this.sessionTokens = new Map(response.tokens);

      //   this.eventHandlers.loaded
      //     .forEach((func) => func(this.response));
      // };
      // onLoad.bind(this);
      // chrome.runtime.sendMessage(
      //   {
      //     event: MIRI_EVENTS.LOAD_TOKENS,
      //   },
      //   onLoad,
      // );

      if (!this.loaded) {
        chrome.storage.local.get(STORAGE_KEYS.TOKENS_KEY, (result = {}) => {
          this.tokens = new Map(result[STORAGE_KEYS.TOKENS_KEY]);
        });

        chrome.storage.session.get(STORAGE_KEYS.TOKENS_KEY, (result = {}) => {
          this.sessionTokens = new Map(result[STORAGE_KEYS.TOKENS_KEY]);
        });

        this.loaded = true;
        this.eventHandlers.loaded
          .forEach((func) => func(this.tokens));
      }
    },
  
    save() {
      var data = {
        [STORAGE_KEYS.TOKENS_KEY]: [...this.tokens]
      };
      chrome.storage.local.set(data);
      
      data = {
        [STORAGE_KEYS.TOKENS_KEY]: [...this.sessionTokens]
      };
      chrome.storage.session.set(data);
    },
  
    exists(token) {
      return this.tokens.has(token)
    },
  
    add(token) {
      var count = 0;
      if (this.exists(token)) {
        count = this.tokens.get(token);
      }
      var sessionCount = 0;
      if (this.sessionTokens.has(token)) {
        sessionCount = this.tokens.get(token);
      }

      this.tokens.set(token, count + 1);
      this.sessionTokens.set(token, sessionCount + 1);
      this.save();
    },
  
    clear(sessionOnly=true) {
      this.sessionTokens = new Map();
      
      if (!sessionOnly)
        this.tokens = new Map();
      //this.eventHandlers.updated
      //  .forEach((func) => func(MIRI_EVENTS.FILTER_DELETED, filter));
    },
  };
  
  TokenStorage.load();
  