/* global

debug
*/

// eslint-disable-next-line no-unused-vars

import {MIRI_EVENTS, STORAGE_KEYS} from '/constants.js';
import { sendToAllTabs } from '/common.js';

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

  has(filter) {
    if (!(filter instanceof Array)) {
      return this.filters.has(filter);
    }
    return filter.map(f => this.filters.has(f)); 
  },

  add(filter) {
    if (!this.has(filter)) {
      //debug('added: '+filter);
      this.filters.add(filter);
      this.save();
      sendToAllTabs({event: MIRI_EVENTS.FILTER_ADDED, filter});
      //this.eventHandlers.updated
      //  .forEach((func) => func(MIRI_EVENTS.FILTER_ADDED, filter));
    }
  },

  delete(filter) {
    if (this.has(filter)) {
      //debug('deleted: '+filter);
      this.filters.delete(filter);
      this.save();
      sendToAllTabs({event: MIRI_EVENTS.FILTER_DELETED, filter});
      //this.eventHandlers.updated
      //  .forEach((func) => func(MIRI_EVENTS.FILTER_DELETED, filter));
    }
  },
};

FilterStorage.load();
