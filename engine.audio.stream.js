(function() {

// dependencies

var app = self.app;
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
    new u.LoopBuffer(audio.loopLength, audio.loopWidth),
    new u.LoopBuffer(audio.loopLength, audio.loopWidth)
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

stream.push = function push(buffer) {
  stream.loopBuffer[0].push(new Float32Array(buffer[0]));
  stream.loopBuffer[1].push(new Float32Array(buffer[1]));
};

stream.read = function read(bytes) {
  stream.bufferAhead();
  stream.buffer[0] = stream.loopBuffer[0].read(bytes);
  if (!stream.buffer[0]) return null;
  stream.buffer[1] = stream.loopBuffer[1].read(bytes);
  return stream.buffer;
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
  if (stream.loopBuffer[0].ahead >= audio.loopWidth) return;
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