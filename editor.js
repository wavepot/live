(function() {

// dependencies

var app = self.app;
var keys = app.keys;
var editor = app.editor;
var engine = app.engine;
var u = app.util;

// properties

editor.el = document.getElementById('editor');

// events

editor.el.onkeyup = function(e) {
  engine.compile(this);
};

editor.el.onkeydown = function(e) {
  keys[e.which].call(this, e);
};

})();