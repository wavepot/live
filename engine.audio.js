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
audio.silenceBuffer = new Float32Array(cfg.audioBufferSize);
audio.bufferSizeQuotient = cfg.audioBufferSize / cfg.streamBufferSize;

// methods

audio.init = function init(context) {
  audio.context = context || new AudioContext;

  audio.numBuffersPerSecond = Math.round(audio.context.sampleRate / cfg.streamBufferSize);
  audio.sampleRate = audio.numBuffersPerSecond * cfg.streamBufferSize;

  audio.setBpm(60);

  audio.node = audio.context.createScriptProcessor(cfg.audioBufferSize, 2, 2);
  audio.node.onaudioprocess = audio.onaudioprocess;
  audio.node.connect(audio.context.destination);

  stream.init();
};

audio.setBpm = function setBpm(bpm) {
  audio.bpm =
    Math.floor(
      Math.round(
        Math.round(audio.sampleRate * 60 / bpm / cfg.streamBufferSize)
        * cfg.streamBufferSize * bpm / 60
      ) / audio.sampleRate * bpm
    );
  audio.numBuffersPerBeat = Math.round(audio.sampleRate * 60 / audio.bpm / cfg.streamBufferSize);
  audio.timeMultiplier = audio.bpm / 60;
  if (stream.loopBuffer) {
    stream.loopBuffer[0].numBuffersPerBeat = audio.numBuffersPerBeat;
    stream.loopBuffer[1].numBuffersPerBeat = audio.numBuffersPerBeat;
  }
};

audio.destroy = function destroy() {
  audio.node.disconnect();
  audio.ondestroy();
};

audio.eval = function eval(code) {
  stream.eval(code);
  audio.oneval();
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

audio.oneval = u.noop;
audio.onstart = u.noop;
audio.onrestart = u.noop;
audio.onplay = u.noop;
audio.onstop = u.noop;
audio.onpause = u.noop;
audio.ondestroy = u.noop;

audio.onaudioprocess = (function() {
  var L, R;
  var i;

  return function onaudioprocess(ev) {
    L = ev.outputBuffer.getChannelData(0);
    R = ev.outputBuffer.getChannelData(1);

    if (!audio.isPlaying) {
      /*
      // these only work in firefox atm, but keep them for reference
      // theoritically they should perform better
      out.copyToChannel(audio.silenceBuffer, 0);
      out.copyToChannel(audio.silenceBuffer, 1);
      */
      L.set(audio.silenceBuffer, 0);
      R.set(audio.silenceBuffer, 0);
      return;
    }

    for (i = 0; i < audio.bufferSizeQuotient; i++) {
      audio.buffer = stream.read();
      if (!audio.buffer) return;
      L.set(audio.buffer[0], i * cfg.streamBufferSize);
      R.set(audio.buffer[1], i * cfg.streamBufferSize);
    }
  };
})();

})();