(function() {

// app container

var app = self.app = {};

// dependencies

var debug = app.debug = {};
var cfg = app.config = {};
var util = app.util = {};
var keys = app.keys = {};
var editor = app.editor = {};
var engine = app.engine = {};

// methods

app.init = function init() {
  debug.init();
  engine.init();
  editor.init();
  debug.watch(app.engine.audio.stream, 'loopBuffer', 0, 'loopWidth');
  debug.watch(app.engine.audio.stream, 'loopBuffer', 0, 'ahead');
  debug.watch(app.engine.audio.stream, 'loopBuffer', 0, 'total');
};

})();