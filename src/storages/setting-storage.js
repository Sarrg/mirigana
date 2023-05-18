/* global
MIRI_EVENTS

debug
*/

// eslint-disable-next-line no-unused-vars

import {MIRI_EVENTS, STORAGE_KEYS, SETTING_DEFAULTS} from '/constants.js';
import { sendToAllTabs } from '/common.js';

export const SettingStorage = {
  settings: null,
  loaded: false,
  onUpdated: null,

  eventHandlers: {
    loaded: [],
    updated: [],
  },

  on(eventName, func) {
    // loaded
    // updated
    this.eventHandlers[eventName].push(func);

    if (eventName === 'loaded' && this.loaded) {
      // emit loaded event immedately if the setting already loaded
      func(this.settings);
    }
  },

  load() {
    if (!this.loaded) {

      function nullish(value, defaultValue) {
        if (value === null || value === undefined) {
          return defaultValue;
        }
        return value;
      }
      
      chrome.storage.sync.get((result = {}) => {
        this.settings = {
          enabled: nullish(result[STORAGE_KEYS.EXTENSION_ENABLED_KEY], SETTING_DEFAULTS.EXTENSION_ENABLED_DEFAULT),
          pct: nullish(result[STORAGE_KEYS.FURIGANA_SIZE_PERCENTAGE_KEY], SETTING_DEFAULTS.FURIGANA_SIZE_PERCENTAGE_DEFAULT),
          color: nullish(result[STORAGE_KEYS.FURIGANA_COLOR_KEY], SETTING_DEFAULTS.FURIGANA_COLOR_DEFAULT),
          furigana_selectable: nullish(result[STORAGE_KEYS.FURIGANA_SELECTABLE_KEY], SETTING_DEFAULTS.FURIGANA_SELECTABLE_DEFAULT),
        }

        this.loaded = true;
        this.eventHandlers.loaded
          .forEach((func) => func(this.settings));
      });
    }
  },

  save() {
    // TODO:
  },

  get(key=null) {
    if (key == null) {
      return this.settings;
    }
    return this.settings[key];
  },

  set(setting) {
    Object.assign(this.settings, setting);

    sendToAllTabs({event: MIRI_EVENTS.SETTING_CHANGED, setting});
    this.eventHandlers.updated
      .forEach((func) => func(this.settings));

    if (this.onUpdated) {
      this.onUpdated(setting);
    }
  },
};

SettingStorage.load();
