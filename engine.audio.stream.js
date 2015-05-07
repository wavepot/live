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
stream.callbacks = { id: 0 };
stream.isBuffering = false;

// methods

stream.init = function init() {
  stream.loopBuffer = [
    new u.LoopBuffer(cfg.loopLength, cfg.streamBufferSize, audio.numBuffersPerSecond),
    new u.LoopBuffer(cfg.loopLength, cfg.streamBufferSize, audio.numBuffersPerSecond)
  ];
};

stream.start = function start() {
  stream.onread = stream.bufferAhead;
  stream.bufferAhead();
};

stream.eval = function eval(code) {
  stream.hasError = false;
  worker.postMessage({
    cmd: 'eval',
    param: code
  });
};

stream.write = function write(buffer) {
  stream.loopBuffer[0].write(buffer[0]);
  stream.loopBuffer[1].write(buffer[1]);
};

stream.read = function read() {
  stream.buffer[0] = stream.loopBuffer[0].read();
  stream.buffer[1] = stream.loopBuffer[1].read();
  if (!stream.buffer[0] || !stream.buffer[1]) return null;
  stream.onread();
  return stream.buffer;
};

stream.reset = function reset() {
  worker.postMessage({
    cmd: 'set',
    param: {
      frame: 0,
      bufferSize: cfg.streamBufferSize,
      sampleRate: audio.sampleRate,
    }
  });
};

stream.bufferAhead = function bufferAhead() {
  if (!audio.isPlaying
    || stream.hasError
    || stream.isBuffering
    || stream.loopBuffer[0].ahead > 1
  ) return;

  stream.isBuffering = true;
  stream.sendBuffers(function(err, buffers) {
    stream.isBuffering = false;

    if (err) return stream.onerror(err);

    stream.onbuffers(buffers);
  });
};

stream.sendBuffers = function sendBuffers(fn) {
  stream.callbacks[++stream.callbacks.id] = fn || u.noop;

  var buffers = [
    stream.loopBuffer[0].acquire(),
    stream.loopBuffer[1].acquire()
  ];

  worker.postMessage({
    cmd: 'rpc',
    param: {
      fn: 'bufferAhead',
      id: stream.callbacks.id,
      payload: buffers
    }
  }, buffers[0].concat(buffers[1]));
};

// events

audio.onstart = function onstart() {
  stream.reset();
};

audio.oneval = function oneval() {
  stream.start();
};

stream.onread = u.noop;

stream.onerror = function onerror(e) {
  stream.hasError = true;
  console.error(e);
};

stream.onbuffers = function onbuffers(buffers) {
  stream.write(buffers);
  stream.bufferAhead();
};

stream.oncallback = function oncallback(callback) {
  var id = stream.callbacks.id;
  stream.callbacks[id](callback.error, callback.payload);
  delete stream.callbacks[id];
};

worker.onmessage = function onmessage(ev) {
  if (ev.data.error) {
    stream.onerror(u.errorFrom(ev.data.error));
  } else {
    stream.oncallback(ev.data);
  }
};

})();