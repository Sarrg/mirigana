/* global

debug
*/

// eslint-disable-next-line no-unused-vars

import {MIRI_EVENTS, STORAGE_KEYS} from '../constants.js';

export const FilterStorage = {
  filters: null,
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
      // emit loaded event immedately if the filters are already loaded
      func(this.filters);
    }
  },

  load() {    
    if (!this.loaded) {
      chrome.storage.sync.get(STORAGE_KEYS.FILTER_LIST_KEY, (result = {}) => {
        this.filters = new Set(result[STORAGE_KEYS.FILTER_LIST_KEY]);

        this.loaded = true;
        this.eventHandlers.loaded
          .forEach((func) => func(this.filters));
      });
    }
  },

  save() {
    const data = {
      [STORAGE_KEYS.FILTER_LIST_KEY]: [...this.filters]
    };
    chrome.storage.sync.set(data);
  },

  filter_exists(filter) {
    return this.filters.has(filter)
  },

  add(filter) {
    if (!this.filter_exists(filter)) {
      //debug('added: '+filter);
      this.filters.add(filter);
      this.save();
      this.eventHandlers.updated
        .forEach((func) => func(MIRI_EVENTS.FILTER_ADDED, filter));
    }
  },

  delete(filter) {
    if (this.filter_exists(filter)) {
      //debug('deleted: '+filter);
      this.filters.delete(filter);
      this.save();
      this.eventHandlers.updated
        .forEach((func) => func(MIRI_EVENTS.FILTER_DELETED, filter));
    }
  },
};

FilterStorage.load();
