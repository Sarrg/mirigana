import {PARSE_ENGINES, STORAGE_KEYS, SETTING_DEFAULTS} from '/constants.js';

const optionsState = {
  [STORAGE_KEYS.CURRENT_PARSE_ENGINE_KEY]: SETTING_DEFAULTS.CURRENT_PARSE_ENGINE_DEFAULT,
  engineKeyOrigin: SETTING_DEFAULTS.CURRENT_PARSE_ENGINE_DEFAULT,
};

function localizeElement(ele) {
  const key = ele.innerText.replace(/^__MSG_/, '');
  ele.innerText = chrome.i18n.getMessage(key);
}

async function _onSettingsImportFileChanged(e) {
  //const date = new Date(Date.now)
  const files = e.target.files;

  if (files.length === 0) {
    return;
  }
  
  const file = files[0];
  e.target.value = null;
  
  const fileLoad = new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

  const fileContent = await fileLoad;
  const data = JSON.parse(fileContent);
  // TODO: JSON checks

  chrome.storage.sync.set(data);
}


async function _onSettingsExportClick() {
  //const date = new Date(Date.now)
  const data = await chrome.storage.sync.get();
  const filename = `mirigana-settings.json`;
  const blob = new Blob([JSON.stringify(data, null, 4)], {type: 'application/json'});
  const blobURL = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobURL;
  link.download = filename;
  link.rel = 'noopener';
  link.target = '_blank';
  link.dispatchEvent(new MouseEvent('click'));
}

const mainContainer = document.querySelector('.main-container');
const optionContainer = mainContainer.querySelector('.option');
const optionLabel = mainContainer.querySelector('.label');
const optionNotice = mainContainer.querySelector('.notice');
const optionApplyBtn = mainContainer.querySelector('.apply');
const importSettingsBtn = mainContainer.querySelector('#settings-import');
const importSettingsFile = mainContainer.querySelector('#settings-import-file');
const exportSettingsBtn = mainContainer.querySelector('#settings-export');
localizeElement(optionLabel);
localizeElement(optionNotice);
localizeElement(optionApplyBtn);
localizeElement(importSettingsBtn);
localizeElement(exportSettingsBtn);

optionApplyBtn.addEventListener('click', () => {
  chrome.storage.local.set({
    [STORAGE_KEYS.CURRENT_PARSE_ENGINE_KEY]: optionsState[STORAGE_KEYS.CURRENT_PARSE_ENGINE_KEY],
  }, () => {
    chrome.runtime.reload();
    optionsState.engineKeyOrigin = optionsState[STORAGE_KEYS.CURRENT_PARSE_ENGINE_KEY];
    optionApplyBtn.setAttribute('disabled', 'disabled');
    window.close();
  });
});

importSettingsBtn.addEventListener('click', () => {document.querySelector('#settings-import-file').click();});
importSettingsFile.addEventListener('change', _onSettingsImportFileChanged)
exportSettingsBtn.addEventListener('click', _onSettingsExportClick);

function createDOM(type, options, ...children) {
  const container = document.createElement(type);
  if (typeof options === 'string') {
    container.className = options;
  } else {
    const { className, ...restOpts } = options;
    container.className = className;

    Object.keys(restOpts).forEach((k) => {
      if (!k.startsWith('on')) {
        return;
      }

      const event = restOpts[k];
      const eventName = k.replace('on', '').toLowerCase();
      container.addEventListener(eventName, event);
    });
  }

  children.forEach((child) => container.appendChild(child));
  return container;
}

function text(textContent) {
  return document.createTextNode(textContent);
}

function div(options, ...children) {
  return createDOM('div', options, ...children);
}

function span(options, ...children) {
  return createDOM('span', options, ...children);
}

function composeEngineOption(currentEngine) {
  PARSE_ENGINES.forEach((engine) => {
    const activeClassName = (engine.key === currentEngine)
      ? 'active'
      : '';

    const blockOptions = {
      className: `block ${activeClassName}`,
      onClick() {
        const allBlocks = document.querySelectorAll('.block');
        allBlocks.forEach((ele) => ele.classList.remove('active'));

        if (optionsState.engineKeyOrigin !== engine.key) {
          optionsState[STORAGE_KEYS.CURRENT_PARSE_ENGINE_KEY] = engine.key;
          optionApplyBtn.removeAttribute('disabled');
        } else {
          optionApplyBtn.setAttribute('disabled', 'disabled');
        }

        this.classList.add('active');
      },
    };

    const title = chrome.i18n.getMessage(`${engine.i18nKey}_title`);
    const description = chrome.i18n.getMessage(`${engine.i18nKey}_description`);

    const optionBlock = div(blockOptions,
      div('block-selector',
        div('wrap',
          div('title',
            text(title),
            span('check-mark', text('✓'))),
          div('description',
            text(description)))));

    optionContainer.appendChild(optionBlock);
  });
}

chrome.storage.local.get((result = {}) => {
  let currentEngine = result[STORAGE_KEYS.CURRENT_PARSE_ENGINE_KEY];

  if (!currentEngine) {
    // write the default value immedately
    currentEngine = optionsState[STORAGE_KEYS.CURRENT_PARSE_ENGINE_KEY];
    chrome.storage.local.set({
      [STORAGE_KEYS.CURRENT_PARSE_ENGINE_KEY]: currentEngine,
    });
  }

  optionsState[STORAGE_KEYS.CURRENT_PARSE_ENGINE_KEY] = currentEngine;
  optionsState.engineKeyOrigin = currentEngine;
  composeEngineOption(currentEngine);
});
