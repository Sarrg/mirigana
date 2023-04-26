/* global
MIRI_EVENTS

debug
*/

// eslint-disable-next-line no-unused-vars
const FilterStorage = {
  filters: new Set(),
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
    chrome.runtime.sendMessage(
      {
        event: MIRI_EVENTS.LOAD_FILTERS,
      },
      (response) => {
        debug('responsed: LOAD_FILTERS');
        this.loaded = true;
        this.filters = new Set(response.filters);

        this.eventHandlers.loaded
          .forEach((func) => func(this.response));

        // this.checkReady();
      },
    );
  },

  save() {
    const data = {
      [FILTER_LIST_KEY]: [...this.filters]
    };
    chrome.storage.sync.set(data);
  },

  filter_exists(filter) {
    return this.filters.has(filter)
  },

  add(filter) {
    if (!this.filter_exists(filter)) {
      debug('added: '+filter);
      this.filters.add(filter);
      this.save();
      this.eventHandlers.updated
        .forEach((func) => func(MIRI_EVENTS.FILTER_ADDED, filter));
    }
  },

  delete(filter) {
    if (this.filter_exists(filter)) {
      debug('deleted: '+filter);
      this.filters.delete(filter);
      this.save();
      this.eventHandlers.updated
        .forEach((func) => func(MIRI_EVENTS.FILTER_DELETED, filter));
    }
  },
};

FilterStorage.load();
