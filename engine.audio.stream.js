(function() {

// dependencies

var app = self.app;
var cfg = app.config;
var engine = app.engine;
var audio = engine.audio;
var stream = audio.stream;
var worker = audio.stream.worker = new Worker('engine.audio.stream.worker.js');
var u = app.util;

// properties

stream.buffer = [null, null];
stream.hasError = false;
stream.isBuffering = false;

// methods

stream.init = function init() {
  stream.loopBuffer = [
    new u.LoopBuffer(cfg.loopLength, cfg.bufferSize, audio.numBuffersPerSecond),
    new u.LoopBuffer(cfg.loopLength, cfg.bufferSize, audio.numBuffersPerSecond)
  ];
};

stream.eval = function eval(code) {
  stream.hasError = false;
  worker.postMessage({
    cmd: 'eval',
    param: code
  });
  stream.bufferAhead();
};

stream.write = function write(buffer) {
  stream.loopBuffer[0].write(buffer[0]);
  stream.loopBuffer[1].write(buffer[1]);
};

stream.read = function read() {
  stream.bufferAhead();
  stream.buffer[0] = stream.loopBuffer[0].read();
  stream.buffer[1] = stream.loopBuffer[1].read();
  if (!stream.buffer[0] || !stream.buffer[1]) return null;
  return stream.buffer;
};

stream.reset = function reset() {
  worker.postMessage({
    cmd: 'set',
    param: {
      frame: 0,
      bufferSize: cfg.bufferSize,
      sampleRate: audio.sampleRate,
    }
  });
};

stream.bufferAhead = function bufferAhead() {
  if (!audio.isPlaying) return;
  if (stream.hasError) return;
  if (stream.isBuffering) return;
  if (stream.loopBuffer[0].ahead > 1) return;

  stream.isBuffering = true;

  var buffers = [
    stream.loopBuffer[0].acquire(),
    stream.loopBuffer[1].acquire()
  ];

  worker.postMessage({
    cmd: 'bufferAhead',
    param: buffers
  }, buffers[0].concat(buffers[1]));
};

// events

audio.onstart = function onstart() {
  stream.reset();
};

stream.onerror = function onerror(e) {
  stream.hasError = true;
  console.error(e);
};

stream.onbuffers = function onbuffers(buffers) {
  stream.write(buffers);
  stream.bufferAhead();
};

worker.onmessage = function onmessage(ev) {
  stream.isBuffering = false;
  if (ev.data.error) {
    stream.onerror(u.errorFrom(ev.data.error));
  } else {
    stream.onbuffers(ev.data);
  }
};

})();