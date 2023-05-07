/* global
EXTENSION_ENABLED_KEY
EXTENSION_ENABLED_DEFAULT
FURIGANA_SIZE_PERCENTAGE_KEY
FURIGANA_SIZE_PERCENTAGE_DEFAULT
FURIGANA_COLOR_KEY
FURIGANA_COLOR_DEFAULT
FURIGANA_SELECTABLE_KEY
FURIGANA_SELECTABLE_DEFAULT
MIRI_EVENTS
FURIGANA_COLORS
*/

function fillText(id, textOrKey, useKey) {
  const ele = document.querySelector(id);
  ele.textContent = useKey
    ? chrome.i18n.getMessage(textOrKey)
    : textOrKey;
}
const manifest = chrome.runtime.getManifest();
const matches = manifest['content_scripts'][0]['matches'];

const broadcast = (event, value) => {
  matches.forEach((match) => {
    chrome.tabs.query({url: match}, (tabs) => {
      if (!tabs.length) {
        return;
      }

      const msg = {
        event,
        value,
      };
      tabs.forEach((t) => chrome.tabs.sendMessage(t.id, msg));
    })
  });
};

const sendToActiveTab = async (event, value) => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  
  if (tab !== undefined) {
    const msg = {
      event,
      value,
    };
    chrome.tabs.sendMessage(tab.id, msg);
  }
}

function prepareToggleButton(initValue) {
  const DISABLE_CLASSNAME = 'disabled';
  const toggler = document.querySelector('.round-toggle-button');
  if (!initValue) {
    toggler.classList.add(DISABLE_CLASSNAME);
  }

  toggler.addEventListener('click', (e) => {
    e.currentTarget.classList.toggle(DISABLE_CLASSNAME);
    const enabled = !e.currentTarget.classList.contains(DISABLE_CLASSNAME);

    // update to storage
    const saveData = {
      [EXTENSION_ENABLED_KEY]: enabled,
    };
    chrome.storage.sync.set(saveData);

    broadcast(MIRI_EVENTS.TOGGLE_EXTENSION, enabled);
  });
}

function prepareColorSwitcher(initValue) {
  const switcher = document.querySelector('.color-switcher');
  FURIGANA_COLORS.forEach((c) => {
    const tile = document.createElement('div');
    tile.className = 'block';
    tile.style.backgroundColor = c.value;
    tile.dataset.color = c.value;

    if (c.value === initValue) {
      tile.className += ' active';
    }

    switcher.appendChild(tile);
  });

  switcher.addEventListener('click', (e) => {
    if (!e.target.className.includes('block')) {
      // ignore when trigger from the color-switcher
      return;
    }

    const { color } = e.target.dataset;

    // update class
    switcher.querySelectorAll('.block').forEach((ele) => {
      ele.className = 'block';
    });
    e.target.className = 'block active';

    // update to storage
    const saveData = {
      [FURIGANA_COLOR_KEY]: color,
    };
    chrome.storage.sync.set(saveData);

    broadcast(MIRI_EVENTS.UPDATE_FURIGANA_COLOR, color);
  });
}

function prepareKanaSizeRange(initValue) {
  const range = document.querySelector('.kana-size input');
  range.value = initValue;

  range.addEventListener('input', (e) => {
    const pct = +e.target.value;
    fillText('.kana-size .value', pct);

    // update to storage
    const saveData = {
      [FURIGANA_SIZE_PERCENTAGE_KEY]: pct,
    };
    chrome.storage.sync.set(saveData);

    broadcast(MIRI_EVENTS.UPDATE_FURIGANA_SIZE, pct);
  });
}

function prepareKanaSelection(initValue) {
  const selection = document.querySelector('.kana-selection input');
  selection.checked = initValue;

  selection.addEventListener('change', (e) => {
    const furigana_selectable = e.target.checked;
    // update to storage
    const saveData = {
      [FURIGANA_SELECTABLE_KEY]: furigana_selectable,
    };
    chrome.storage.sync.set(saveData);

    broadcast(MIRI_EVENTS.UPDATE_FURIGANA_SELECTABLE, furigana_selectable);
  });
}

function nullish(value, defaultValue) {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return value;
}

// load from storage
chrome.storage.sync.get([
  EXTENSION_ENABLED_KEY,
  FURIGANA_SIZE_PERCENTAGE_KEY,
  FURIGANA_SELECTABLE_KEY,
  FURIGANA_COLOR_KEY,
], (result = {}) => {
  const disabled = nullish(result[EXTENSION_ENABLED_KEY], EXTENSION_ENABLED_DEFAULT);
  prepareToggleButton(disabled);

  const pct = nullish(result[FURIGANA_SIZE_PERCENTAGE_KEY], FURIGANA_SIZE_PERCENTAGE_DEFAULT);
  prepareKanaSizeRange(pct);

  const color = nullish(result[FURIGANA_COLOR_KEY], FURIGANA_COLOR_DEFAULT);
  prepareColorSwitcher(color);

  const furigana_selectable = nullish(result[FURIGANA_SELECTABLE_KEY], FURIGANA_SELECTABLE_DEFAULT);
  prepareKanaSelection(furigana_selectable);

  fillText('.kana-size .literal', 'ui_furigana_size', true);
  fillText('.kana-size .value', pct);
  fillText('.kana-selection .literal', 'ui_skip_furigana_selection', true);
  fillText('.footer .feedback', 'ui_feedback', true);
  fillText('.footer .version', `Ver ${chrome.runtime.getManifest().version}`);
});

document.querySelector('#element-picker').addEventListener('click', () => {
  sendToActiveTab(MIRI_EVENTS.ACTIVATE_ELEMENT_PICKER);
  window.close();
  return true;
});

// bind a tag
document.querySelector('.feedback').addEventListener('click', () => {
  // e.preventDefault();
  chrome.tabs.create({
    url: 'https://twitter.com/ctx_mirigana',
    active: true,
  });
  return false;
});
