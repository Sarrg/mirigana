/* global
MIRI_EVENTS

debug
*/

// eslint-disable-next-line no-unused-vars

const selectorReplacer = (k, v) => {
  if (k === '') {
    return Array.from(v);
  }
  if (k === 'queries') {
    return Array.from(v);
  }
  return v;
}

const selectorReviver = (k, v) => {
  if (k === '') {
    return new Map(v);
  }
  if (k === 'queries') {
    return new Set(v);
  }
  return v;
}

const SelectorStorage = {
  selectors: new Map(),
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
    chrome.runtime.sendMessage(
      {
        event: MIRI_EVENTS.LOAD_SELECTORS,
      },
      (response) => {
        debug('responsed: LOAD_SELECTORS');
        this.loaded = true;
        const parsed = JSON.parse(response.selectors, selectorReviver);
        this.selectors = new Map(parsed);

        this.eventHandlers.loaded
          .forEach((func) => func(this.response));

        // this.checkReady();
      },
    );
  },

  save() {
    const data = {
      [SELECTORS_KEY]: JSON.stringify(this.selectors, selectorReplacer)
    };
    chrome.storage.sync.set(data);
  },

  has_selector(site, query='') {
    return this.selectors.has(site) && (query === '' || this.selectors[site]['queries'].has(query));
  },

  add(selector) {
    [site, component, query] = selector
    if (!this.selectors.has(site)) {
      this.selectors.set(site, {})
      this.selectors.get(site)['component'] = component;
      this.selectors.get(site)['queries'] = new Set();
    }

    const queries = this.selectors.get(site)['queries']
    if (!queries.has(query)) {
      debug('added: '+query);
      queries.add(query);
      this.save();
      this.eventHandlers.updated
        .forEach((func) => func(MIRI_EVENTS.SELECTOR_ADDED, query));
    }
  },

  delete(selector) {
    [site, query] = selector
    if (this.has_selector(site, query)) {
      debug('deleted: '+query);
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
