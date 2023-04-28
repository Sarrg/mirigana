/* global
MIRI_EVENTS

Miri
log
debug

elementpicker
*/

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { event, value } = request;
    if (event === MIRI_EVENTS.ACTIVATE_ELEMENT_PICKER) {
      //elementpicker();

      var picker = new ElementPicker();
      picker.transition = "all 50ms ease";
      picker.action = {
        trigger: "click",
        callback: (function (target) {
          var nodes = null;
          if (target.className === '') {
            nodes = document.querySelectorAll(target.tagName);
          }
          else {
            nodes = document.querySelectorAll(`.${target.className}`);
          }
          nodes.forEach((node) => {node.style.outline = "#f00 solid 2px";});
          picker.close();
          picker = null;
        })
      };
    }
  });
  