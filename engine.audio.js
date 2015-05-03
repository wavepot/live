(function() {

// dependencies

var app = self.app;
var cfg = app.config;
var engine = app.engine;
var audio = engine.audio;
var stream = audio.stream = {};
var u = app.util;

// properties

audio.isPlaying = false;
audio.bufferSize = cfg.bufferSize;
audio.maxLoopBars = cfg.maxLoopBars;
audio.silenceBuffer = new Float32Array(audio.bufferSize);

// methods

audio.init = function init() {
  audio.context = new AudioContext;
  audio.sampleRate = audio.context.sampleRate;

  // TODO: should adjust to time signature, presume 120bpm 4/4 or 1s===1bar
  audio.barLength = Math.round(audio.sampleRate);

  audio.node = audio.context.createScriptProcessor(audio.bufferSize, 2, 2);
  audio.node.onaudioprocess = audio.onaudioprocess;
  audio.node.connect(audio.context.destination);
  stream.init();
};

audio.eval = function eval(code) {
  stream.eval(code);
};

audio.start = function start() {
  audio.isPlaying = true;
  audio.onstart(audio);
  audio.play();
};

audio.play = function play() {
  audio.isPlaying = true;
  audio.onplay(audio);
};

audio.stop = function stop() {
  audio.isPlaying = false;
  audio.onstop(audio);
};

audio.togglePause = function togglePause() {
  if (audio.isPlaying) {
    audio.isPlaying = false;
    audio.onpause(audio);
  } else {
    audio.play();
  }
};

audio.restart = function restart() {
  audio.stop();
  audio.onrestart(audio);
  audio.start();
};

// events

audio.onstart = u.noop;
audio.onrestart = u.noop;
audio.onplay = u.noop;
audio.onstop = u.noop;
audio.onpause = u.noop;

audio.onaudioprocess = u.push(u.pull('outputBuffer'), function onaudioprocess(out) {
  if (!audio.isPlaying) {
    /*
    // these only work in firefox atm, but keep them for reference
    // theoritically they should perform better
    out.copyToChannel(audio.silenceBuffer, 0);
    out.copyToChannel(audio.silenceBuffer, 1);
    */
    out.getChannelData(0).set(audio.silenceBuffer, 0);
    out.getChannelData(1).set(audio.silenceBuffer, 0);
    return;
  }

  audio.buffer = stream.read(audio.bufferSize);
  if (!audio.buffer) return;

  out.getChannelData(0).set(audio.buffer[0], 0);
  out.getChannelData(1).set(audio.buffer[1], 0);
});

})();