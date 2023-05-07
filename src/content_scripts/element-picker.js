/* global
MIRI_EVENTS

Miri
log
debug

ElementPicker
*/

var selector_query = '';

const createButton = function(id, text) {
  const btn = document.createElement('button');
  btn.setAttribute('id', id);
  btn.setHTML(text);
  return btn
}

const removeBar = async function() {
  const bar = document.body.querySelector('#filterbar');
  if (bar !== null) {
    document.body.removeChild(bar);
  }
}

const addBar = async function() {
  let bar = document.body.querySelector('#filterbar');
  if (bar === null) {
    updateStyleNode("filterbar",`
      #filterbar {
        visibility: hidden;
        margin-left: -125px;
        background-color: #333;
        color: #fff;
        text-align: center;
        border-radius: 2px;
        padding: 8px;
        margin: 5px;
        position: fixed;
        z-index: 1;
        left: 50%;
        bottom: 30px;
        font-size: 17px;
      }

      #filterbar.show {
        visibility: visible;
        -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
        animation: fadein 0.5s, fadeout 0.5s 2.5s;
      }
    `);
    bar = document.createElement('div');
    bar.setAttribute("id", "filterbar");

    const create_btn = createButton('create_btn', 'Create');
    const pick_btn = createButton('pick_btn', 'Pick');
    const quit_btn = createButton('quit_btn', 'Quit');
    bar.appendChild(create_btn);
    bar.appendChild(pick_btn);
    bar.appendChild(quit_btn);

    create_btn.addEventListener('click', (e) => {
      unpick();
      removeBar();
    });

    pick_btn.addEventListener('click', (e) => {
      unpick();
      const bar = document.body.querySelector('#filterbar');
      bar.className = '';
      e.stopImmediatePropagation();
      activate_picker();
    });

    quit_btn.addEventListener('click', (e) => {
      unpick();
      removeBar();
    });

    document.body.appendChild(bar);
  }
}

const pick = async function() {
  const nodes = document.querySelectorAll(selector_query);
  nodes.forEach((node) => {node.style.outline = "#f00 solid 2px";});

  const bar = document.body.querySelector('#filterbar');
  bar.className = 'show';
}

const unpick = async function() {
  const nodes = document.querySelectorAll(selector_query);
  nodes.forEach((node) => {node.style.outline = "";});
  selector_query = ""
}

const activate_picker = async function() {
  var picker = new ElementPicker();
  picker.transition = "all 50ms ease";
  picker.action = {
    trigger: "click",
    callback: (function (target) {
      if (target.className === '') {
        selector_query = target.tagName
      }
      else {
        selector_query = `.${target.className}`
      }
      pick();
      picker.close();
      picker = null;
    })
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event, value } = request;
  if (event === MIRI_EVENTS.ACTIVATE_ELEMENT_PICKER) {
    addBar();
    activate_picker();
  }
});
