/* global
MIRI_EVENTS

debug
*/

// eslint-disable-next-line no-unused-vars

import {MIRI_EVENTS, STORAGE_KEYS} from '/constants.js';
import {sendToAllTabs} from '/common.js';

export const TokenStorage = {
    tokens: new Map(),
    sessionTokens: new Map(),
    loaded: false,
    changed: false,
    saveDelay: 10000,
  
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
      this.changed = false;
    },
  
    has(token) {
      return this.tokens.has(token)
    },
  
    add(token) {
      var count = 0;
      if (this.has(token)) {
        count = this.tokens.get(token);
      }
      var sessionCount = 0;
      if (this.sessionTokens.has(token)) {
        sessionCount = this.tokens.get(token);
      }

      this.tokens.set(token, count + 1);
      this.sessionTokens.set(token, sessionCount + 1);

      if (!this.changed) {
        setTimeout(() => { this.save()}, this.saveDelay);
      }
      this.changed = true;
    },

    get(sessionOnly=false) {
      if (sessionOnly) {
        return this.sessionTokens;
      }
      else {
        return this.tokens;
      }
    },
  
    clear(sessionOnly=true) {
      this.sessionTokens = new Map();
      if (!sessionOnly) {
        this.tokens = new Map();
      }
      this.save();
    },
  };
  
  TokenStorage.load();
  