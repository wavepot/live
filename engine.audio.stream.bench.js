(function() {

// dependencies

var bench = self.bench;
var app = self.app;
var cfg = app.config;
var engine = app.engine;
var audio = engine.audio;
var stream = audio.stream;
var u = app.util;

//

setTimeout(init, 0);

var code = 'exports.dsp = function(t) { return Math.random() * 2 - 1; };';

function init() {
  stream.read = bench.wrap('read', stream.read);
  stream.write = bench.wrap('write', stream.write);
  stream.onbuffers = bench.outwrap('onbuffers', stream.onbuffers);
  audio.onaudioprocess = u.noop;
  audio.init();
  audio.onstart = function() {
    stream.reset();
    stream.eval(code);
    bench('all', 1000, run, audio.stop);
  };
  audio.start();
}

var res;

function run(next) {
  stream.read();
  setTimeout(next, 10); //cfg.bufferSize / audio.context.sampleRate * 1000);
}


})();