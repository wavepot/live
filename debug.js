(function() {

// dependencies

var app = self.app;
var debug = app.debug;
var slice = [].slice;

// properties

debug.el = document.getElementById('debug');
debug.watching = [];

// methods

debug.init = function init() {
  setInterval(debug.print, 16);
};

debug.print = function print() {
  debug.el.textContent = 
  debug.watching
  .map(function(el) {
    var label = [];
    var value = el.reduce(function(p, n) {
      label.push(n);
      return p[n];
    });
    return label.join('.') + ': ' + value;
  })
  .join('\n');
};

debug.watch = function watch() {
  debug.watching.push(slice.call(arguments));
};

})();