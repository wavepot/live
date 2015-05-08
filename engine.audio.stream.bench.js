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

setTimeout(next, 0);

var code = 'exports.dsp = function(t) { return Math.random() * 2 - 1; };';

var count = 100;
var context = new AudioContext;
var streamBuffer;
var outputBuffer;

var audioBufferSizeMin = 1024;
var audioBufferSizeMax = 8192;
var streamBufferSizeMin = 512;
var streamBufferSizeMax = 1024;

var audioBufferSize = Math.max(audioBufferSizeMin, streamBufferSizeMin);

function next(streamBufferSize) {
  if (!streamBufferSize) {
    streamBufferSize = streamBufferSizeMin;
  } else {
    streamBufferSize *= 2;
  }

  if (streamBufferSize > audioBufferSize || streamBufferSize > streamBufferSizeMax) {
    audioBufferSize *= 2;
    streamBufferSize = streamBufferSizeMin;
    if (audioBufferSize > audioBufferSizeMax) return bench.measureAll();
  }

  cfg.audioBufferSize = audioBufferSize;
  cfg.streamBufferSize = streamBufferSize;
  audio.bufferSizeQuotient = cfg.audioBufferSize / cfg.streamBufferSize;

  var caseKey = audioBufferSize + '/' + streamBufferSize;
  console.log(caseKey);

  outputBuffer = [
    new Float32Array(cfg.audioBufferSize),
    new Float32Array(cfg.audioBufferSize)
  ];

  audio.onaudioprocess = u.noop;
  audio.init(context);
  audio.onstart = function() {
    stream.reset();
    stream.eval(code);
    bench.time(caseKey);
    bench.repeat(count, runner, function() {
      bench.timeEnd(caseKey, count);
      audio.destroy();
      next(streamBufferSize);
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