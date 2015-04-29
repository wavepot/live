(function() {

// dependencies

var app = self.app;
var engine = app.engine;
var editor = app.editor;
var audio = engine.audio = {};
var u = app.util;

// methods

engine.init = function() {
  audio.init();
  audio.start();
  editor.onchange = engine.audio.eval;
  editor.init();
  setTimeout(engine.audio.stop, 5000);
};

})();