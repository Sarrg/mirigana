/* global
MIRI_EVENTS

Miri
log
debug

ElementPicker
*/

var component_query = '';
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
      create_selector();
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

const create_selector = function() {
  const loc = window.location;
  const site = loc.host;

  const selector = [
    site,
    component_query,
    selector_query,
  ]
  SelectorStorage.add(selector);
}

const pick = async function() {
  const component = document.body.querySelector(component_query);
  const nodes = component.querySelectorAll(selector_query);
  nodes.forEach((node) => {node.style.outline = "#f00 solid 2px";});

  const bar = document.body.querySelector('#filterbar');
  bar.className = 'show';
}

const unpick = async function() {
  const component = document.body.querySelector(component_query);
  const nodes = component.querySelectorAll(selector_query);
  nodes.forEach((node) => {node.style.outline = '';});
  component_query = '';
  selector_query = '';
}

const get_element_query = function (element) {
  query = element.tagName;
  if (element.id !== '') {
    query += '#' + element.id;
  }
  if (element.className !== '') {
    query += '.' + element.className.replaceAll(' ', '.');
  }
  return query;
}

const activate_picker = async function() {
  addBar();
  var picker = new ElementPicker();
  picker.transition = "all 50ms ease";
  picker.action = {
    trigger: "click",
    callback: (function (target) {
      var inspect = target.parentNode;
      while (inspect !== document.body) {
        if (inspect.childElementCount > 1) {
          mainComponent = inspect;
        }
        inspect = inspect.parentNode;
      }

      component_query = get_element_query(mainComponent);
      selector_query = get_element_query(target);
      pick();
      picker.close();
      picker = null;
    })
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event, value } = request;
  if (event === MIRI_EVENTS.ACTIVATE_ELEMENT_PICKER) {
    activate_picker();
  }
});
