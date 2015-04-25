(function() {

// dependencies

var app = self.app;
var engine = app.engine;
var u = app.util;

// properties

engine.code = '';

// methods

engine.compile = u.debounce(u.push(u.pull('value'), function compile(code) {
  if (code === engine.code) return;

  engine.code = code;

  console.log('should compile', engine.code);
}), 300);

})();