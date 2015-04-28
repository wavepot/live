(function() {

// dependencies

var app = self.app;
var engine = app.engine;
var audio = engine.audio;
var stream = audio.stream;
var worker = audio.stream.worker = new Worker('engine.audio.stream.worker.js');
var u = app.util;

// properties

stream.buffer = null;
stream.hasError = false;
stream.isBuffering = false;

// methods

stream.init = function init() {
  stream.loopBuffer = new u.LoopBuffer(audio.loopLength);
};

stream.eval = function eval(code) {
  stream.hasError = false;
  worker.postMessage({
    cmd: 'eval',
    param: code
  });
  stream.bufferAhead();
};

stream.push = function push(buffer) {
  stream.loopBuffer.push(new Float32Array(buffer));
};

stream.shift = function shift() {
  stream.bufferAhead();
  return stream.loopBuffer.shift();
};

stream.reset = function reset() {
  worker.postMessage({
    cmd: 'set',
    param: {
      frame: 0,
      bufferSize: audio.bufferSize,
      sampleRate: audio.sampleRate,
    }
  });
};

stream.bufferAhead = function bufferAhead() {
  if (!audio.isPlaying) return;
  if (stream.hasError) return;
  if (stream.isBuffering) return;
  if (stream.loopBuffer.size >= audio.maxBuffers) return;
  stream.isBuffering = true;
  worker.postMessage({
    cmd: 'bufferAhead'
  });
};

// events

audio.onstart = function onstart() {
  stream.reset();
};

stream.onerror = function onerror(e) {
  stream.hasError = true;
  console.error(e);
};

worker.onmessage = function onmessage(ev) {
  stream.isBuffering = false;
  stream.bufferAhead();
  if (ev.data.error) {
    stream.onerror(u.errorFrom(ev.data.error));
  } else {
    stream.push(ev.data);
  }
};

})();