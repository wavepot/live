(function() {

// dependencies

var app = self.app;
var cfg = app.config;
var engine = app.engine;
var audio = engine.audio;
var stream = audio.stream = {};
var u = app.util;

// properties

audio.playing = false;
audio.context = new AudioContext;
audio.bufferSize = cfg.bufferSize;
audio.sampleRate = audio.context.sampleRate;
audio.fourBars = 4 * audio.sampleRate / audio.bufferSize | 0;
audio.node = audio.context.createScriptProcessor(audio.bufferSize, 2, 2);
audio.empty = new Float32Array(audio.bufferSize);
audio.buffer = null;
audio.floats = { L: null, R: null };
var out = audio.out = { L: null, R: null };

// methods

audio.init = function() {
  audio.node.connect(audio.context.destination);
};

audio.eval = function(code) {
  // todo: send to worker
};

audio.play = function() {
  audio.playing = true;
  audio.onplay();
};

audio.stop = function() {
  audio.playing = false;
  audio.onstop();
};

audio.pause = function() {
  if (audio.playing) {
    audio.playing = false;
    audio.onpause();
  } else {
    audio.play();
  }
};

// events

audio.onplay = u.noop;
audio.onstop = u.noop;
audio.onpause = u.noop;

audio.node.onaudioprocess = function(ev) {
  out.L = ev.outputBuffer.getChannelData(0);
  out.R = ev.outputBuffer.getChannelData(1);

  // use empty buffers(silence) when not playing
  if (!audio.playing) {
    out.L.set(audio.empty, 0);
    out.R.set(audio.empty, 0);
    return;
  }

  audio.buffer = stream.read();
  if (!audio.buffer) {
    stream.rewind(audio.fourBars);
    audio.buffer = stream.read();
    if (!audio.buffer) return;
  }

  if (Array.isArray(audio.buffer)) {
    // stereo
    audio.floats.L = new Float32Array(audio.buffer[0]);
    audio.floats.R = new Float32Array(audio.buffer[1]);
    out.L.set(audio.floats.L, 0);
    out.R.set(audio.floats.R, 0);
  } else {
    // mono
    audio.floats.L = new Float32Array(audio.buffer);
    out.L.set(audio.floats.L, 0);
    out.R.set(audio.floats.L, 0);
  }
};

})();