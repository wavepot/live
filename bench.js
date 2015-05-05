(function() {

// export

self.bench = bench;

// properties

bench.el = document.getElementById('bench');
bench.cases = {};

// main

function bench(label, count, fn, done) {
  var c = count;

  bench.time(label);

  fn(next);

  function next() {
    if (--c) fn(next);
    else {
      bench.timeEnd(label, count);
      bench.measureAll();
      if (done) done();
    }
  }
}

// methods

bench.print = function print(msg) {
  bench.el.textContent += msg;
};

bench.measure = function measure(label) {
  var c = bench.cases[label];
  var each = c.total / c.count;
  bench.print([
    label,
    Array(label.length + 1).join('-'),
    'count: ' + c.count,
    'total: ' + toSeconds(c.total),
    'each: ' + each.toFixed(3) + 'ms',
  ].join('\n') + '\n' + '\n');
};

bench.measureAll = function() {
  for (var label in bench.cases) {
    bench.measure(label);
  }
};

bench.time = function time(label) {
  var c = bench.cases[label] || (bench.cases[label] = new bench.Case(label));
  c.then = Date.now();
};

bench.timeEnd = function timeEnd(label, count) {
  var c = bench.cases[label];
  if (!c) return;
  var then = c.then;
  var diff = Date.now() - then;
  if (count) c.count = count;
  else c.count++;
  return c.total += diff;
};

bench.wrap = function wrap(label, fn) {
  return function wrapper(a, b, c, d, e) {
    bench.time(label);
    var res = fn(a, b, c, d, e);
    bench.timeEnd(label);
    return res;
  };
};

bench.outwrap = function outwrap(label, fn) {
  return function wrapper(a, b, c, d, e) {
    bench.timeEnd(label);
    bench.time(label);
    var res = fn(a, b, c, d, e);
    return res;
  };
};

// constructor

bench.Case = function Case(label) {
  this.label = label;
  this.then = 0;
  this.count = 0;
  this.total = 0;
};

// utils

function toSeconds(ms) {
  return (ms / 1000).toFixed(3) + 's';
}

})();