(function() {

// dependencies

var app = self.app;
var u = app.util;

// methods

u.noop = function noop() {
  // noop
};

u.extend = function extend(dest, src) {
  for (var key in src) dest[key] = src[key];
};

u.push = function push(a, b) {
  return function(arg) {
    b(a(arg));
  };
};

u.pull = function pull(key) {
  return function(obj) {
    return obj[key];
  };
};

u.log = function log(arg) {
  console.log(arg);
};

u.stereo = function stereo(sample) {
  return Array.isArray(sample);
};

// http://stackoverflow.com/a/28483558
u.insertTab = function insertTab(ev) {
  ev.preventDefault();

  var start = this.selectionStart;
  var end = this.selectionEnd;
  var val = this.value;
  var selected = val.substring(start, end);
  var re, match, count;

  if (ev.shiftKey) {
    re = /^\t/gm;
    match = selected.match(re);
    count = -match.length;
    this.value = val.substring(0, start) + selected.replace(re, '') + val.substring(end);
    // TODO: add support for shift-tabbing without a selection
  } else {
    re = /^/gm;
    match = selected.match(re);
    count = match.length;
    this.value = val.substring(0, start) + selected.replace(re, '\t') + val.substring(end);
  }

  if (start === end) {
    this.selectionStart = end + count;
  } else {
    this.selectionStart = start;
  }

  this.selectionEnd = end + count;
};

u.debounce = function debounce(fn, ms) {
  var timeout = null;
  return function(arg) {
    clearTimeout(timeout);
    timeout = setTimeout(fn, ms, arg);
  };
};

u.errorFrom = function errorFrom(error) {
  var err = new Error(error.message);
  err.stack = error.stack;
  return err;
};

})();