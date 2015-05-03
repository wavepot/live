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
    new u.LoopBuffer(audio.barLength, audio.maxLoopBars),
    new u.LoopBuffer(audio.barLength, audio.maxLoopBars)
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
  stream.loopBuffer[0].write(new Float32Array(buffer[0]));
  stream.loopBuffer[1].write(new Float32Array(buffer[1]));
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
      bufferSize: audio.barLength,
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
    stream.write(ev.data);
  }
};

})();