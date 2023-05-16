/* global
MIRI_EVENTS

debug
*/

// eslint-disable-next-line no-unused-vars

import {MIRI_EVENTS, STORAGE_KEYS} from '../constants.js';

const selectorReplacer = (k, v) => {
  if (k === '') {
    return Array.from(v);
  }
  if (k === 'queries') {
    return Array.from(v);
  }
  return v;
}

const createSelector = (site, component, queries=undefined) => {
  const key = site;
  const value = {
    'component': component,
    'queries': new Set(queries),
  };
  return [key, value];
}

export const SelectorStorage = {
  selectors: null,
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
      // emit loaded event immedately if the selectors are already loaded
      func(this.selectors);
    }
  },

  load() {
    if (!this.loaded) {
      chrome.storage.sync.get(STORAGE_KEYS.SELECTORS_KEY, (result = {}) => {
        const selectors = result[STORAGE_KEYS.SELECTORS_KEY];
        
        this.selectors = new Map();

        if (selectors !== undefined) {
          selectors.forEach((selector) => {
            const [key, value] = createSelector(selector[0], selector[1]['component'], selector[1]['queries']);
            this.selectors.set(key, value);
          });
        }
  
        this.loaded = true;
        this.eventHandlers.loaded
          .forEach((func) => func(this.selectors));
      });
    }
  },

  save() {
    const data = {
      // converts selectors to storable structure
      [STORAGE_KEYS.SELECTORS_KEY]: JSON.parse(JSON.stringify(this.selectors, selectorReplacer))
    };
    chrome.storage.sync.set(data);
  },

  has_selector(site, query='') {
    return this.selectors.has(site) && (query === '' || this.selectors[site]['queries'].has(query));
  },

  add(selector) {
    [site, component, query] = selector
    if (!this.selectors.has(site)) {
      const [k, v] = createSelector(site, component);
      this.selectors.set(k, v);
    }

    const queries = this.selectors.get(site)['queries']
    if (!queries.has(query)) {
      //debug('added: '+query);
      queries.add(query);
      this.save();
      this.eventHandlers.updated
        .forEach((func) => func(MIRI_EVENTS.SELECTOR_ADDED, query));
    }
  },

  delete(selector) {
    [site, query] = selector
    if (this.has_selector(site, query)) {
      //debug('deleted: '+query);
      const queries = this.selectors.get(site)['queries']
      queries.delete(query);

      if (queries.size === 0) {
        this.selectors.delete(site);
      }

      this.save();
      this.eventHandlers.updated
        .forEach((func) => func(MIRI_EVENTS.SELECTOR_DELETED, query));
    }
  },
};

SelectorStorage.load();
