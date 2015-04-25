(function() {

// app container

var app = self.app = {};

// dependencies

var cfg = app.config = {};
var util = app.util = {};
var keys = app.keys = {};
var editor = app.editor = {};
var engine = app.engine = {};

// methods

app.init = function init() {
  engine.compile(editor.el);
};

})();