(function() {

// dependencies

var bench = self.bench;
var app = self.app;
var cfg = app.config;
var engine = app.engine;
var audio = engine.audio;
var stream = audio.stream;
var u = app.util;

// bench

setTimeout(next, 0, 128);

var code = 'exports.dsp = function(t) { return Math.random() * 2 - 1; };';

var count = 1000;
var context = new AudioContext;
var streamBuffer;
var outputBuffer;

function next(bufferSize) {
  bufferSize *= 2;
  if (bufferSize > 16384) return bench.measureAll();

  cfg.bufferSize = bufferSize;

  outputBuffer = [
    new Float32Array(bufferSize),
    new Float32Array(bufferSize)
  ];

  audio.onaudioprocess = u.noop;
  audio.init(context);
  audio.onstart = function() {
    stream.reset();
    stream.eval(code);
    bench.time(bufferSize);
    bench.repeat(count, runner, function() {
      bench.timeEnd(bufferSize, count);
      audio.destroy();
      next(bufferSize);
    });
  };
  audio.start();
}

function runner(next) {
  stream.sendBuffers(function(err, buffers) {
    stream.write(buffers);
    streamBuffer = stream.read();
    outputBuffer[0].set(streamBuffer[0], 0);
    outputBuffer[1].set(streamBuffer[1], 0);
    next();
  });
}

})();