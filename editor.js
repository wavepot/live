(function() {

// dependencies

var app = self.app;
var keys = app.keys;
var editor = app.editor;
var engine = app.engine;
var u = app.util;

// properties

editor.el = document.getElementById('editor');

// methods

editor.init = function init() {
  editor.read();
};

editor.read = function read() {
  var content = editor.el.value;
  if (content != editor.content) {
    editor.content = content;
    editor.onchange(editor.content);
  }
  return editor.content;
};

// events

editor.onchange = u.noop;

editor.el.onkeyup = u.debounce(editor.read, 150);

editor.el.onkeydown = function onkeydown(ev) {
  keys[ev.which].call(this, ev);
};

})();