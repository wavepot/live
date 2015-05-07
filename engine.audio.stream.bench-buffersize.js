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

setTimeout(next, 0, 512);

var code = 'exports.dsp = function(t) { return Math.random() * 2 - 1; };';

var count = 1000;
var context = new AudioContext;
var streamBuffer;
var outputBuffer;

function next(bufferSize) {
  bufferSize *= 2;
  if (bufferSize > 1024) return bench.measureAll();

  cfg.streamBufferSize = bufferSize;
  audio.bufferSizeQuotient = cfg.audioBufferSize / cfg.streamBufferSize;

  outputBuffer = [
    new Float32Array(cfg.audioBufferSize),
    new Float32Array(cfg.audioBufferSize)
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
    for (var i = 0; i < audio.bufferSizeQuotient; i++) {
      streamBuffer = stream.read();
      outputBuffer[0].set(streamBuffer[0], i * cfg.streamBufferSize);
      outputBuffer[1].set(streamBuffer[1], i * cfg.streamBufferSize);
    }
    next();
  });
}

})();