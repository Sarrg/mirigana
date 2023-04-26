/* eslint no-unused-vars: 0 */

const MIRI_EVENTS = {
  TOGGLE_EXTENSION: 'TOGGLE_EXTENSION',
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  LOAD_EXTENSION_INFO: 'LOAD_EXTENSION_INFO',
  REQUEST_TOKEN: 'REQUEST_TOKEN',
  UPDATE_FURIGANA_SIZE: 'UPDATE_FURIGANA_SIZE',
  UPDATE_FURIGANA_COLOR: 'UPDATE_FURIGANA_COLOR',
  UPDATE_FURIGANA_SELECTABLE: 'UPDATE_FURIGANA_SELECTABLE',
};

const PARSE_ENGINES = [
  {
    key: 'LOCAL_KUROMOJI',
    i18nKey: 'ui_engine_builtin',
  },
  {
    key: 'MIRIGANA_ONLINE',
    i18nKey: 'ui_engine_online',
  },
];

const FURIGANA_COLORS = [
  {
    key: 'black',
    value: '#000',
  },
  {
    key: 'grey',
    value: '#6C7A89',
  },
  {
    key: 'blue',
    value: '#3498DB',
  },
  {
    key: 'purple',
    value: '#9B59B6',
  },
  {
    key: 'red',
    value: '#E74C3C',
  },
  {
    key: 'white',
    value: '#FFFFFF',
  },
];

const EXTENSION_ENABLED_KEY = 'EXTENSION_ENABLED';
const EXTENSION_ENABLED_DEFAULT = true;

const FURIGANA_SIZE_PERCENTAGE_KEY = 'FURIGANA_SIZE_PERCENTAGE';
const FURIGANA_SIZE_PERCENTAGE_DEFAULT = 50;

const FURIGANA_COLOR_KEY = 'FURIGANA_COLOR';
const FURIGANA_COLOR_DEFAULT = FURIGANA_COLORS[0].value;

const FURIGANA_SELECTABLE_KEY = 'FURIGANA_SELECTABLE';
const FURIGANA_SELECTABLE_DEFAULT = false;

const CURRENT_PARSE_ENGINE_KEY = 'CURRENT_PARSE_ENGINE';
const CURRENT_PARSE_ENGINE_DEFAULT = 'LOCAL_KUROMOJI';
