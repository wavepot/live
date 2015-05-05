
// dependencies

var worker = self;

// properties

worker.fn = null;
worker.frame = 0;
worker.sample = null;
worker.module = { exports: {} };

// methods

worker.set = function set(obj) {
  for (var key in obj) worker[key] = obj[key];
};

worker.eval = function eval(code) {
  try {
    new Function(['exports', 'module'], code)(worker.module.exports, worker.module);
    worker.fn = worker.module.exports.dsp;
    worker.sample = worker.fn(0, 0);
    if (u.isMonophonic(worker.sample)) {
      worker.fn = u.toStereo(worker.fn);
      worker.sample = worker.fn(0, 0);
    }
    var err = u.stereoOr(worker.sample, u.isNumber);
    if (err) throw err;
  } catch(e) {
    worker.fn = null;
    return worker.onerror(e);
  }
};

worker.bufferAhead = (function() {

  // private

  var bufferSize;
  var sampleRate;
  var floats;
  var sample;
  var frame;
  var err;
  var fn;
  var t;
  var i;
  var x;

  // export

  return function bufferAhead(buffers) {
    if (worker.fn) {
      fn = worker.fn;
      worker.fn = null;
    }

    if (!fn) {
      worker.onerror(new Error('no dsp function to process'));
      return;
    }

    bufferSize = worker.bufferSize;
    sampleRate = worker.sampleRate;
    sample = worker.sample;
    frame = worker.frame;

    for (x = 0; x < buffers[0].length; x++) {
      floats = [
        new Float32Array(buffers[0][x]),
        new Float32Array(buffers[1][x])
      ];

      err = fill(floats);
      if (err) {
        worker.fn = fn = null;
        worker.onerror(err);
        return;
      }

      buffers[0][x] = floats[0].buffer;
      buffers[1][x] = floats[1].buffer;
    }

    floats = null;

    worker.frame = frame;
    worker.sample = sample;

    worker.postMessage(
      buffers,
      buffers[0].concat(buffers[1])
    );

    buffers = null;
  };

  function fill(floats) {
    for (i = 0; i < bufferSize; i++, frame++) {
      t = frame / sampleRate;
      sample = fn(t, frame);
      err = u.stereoOr(sample, u.isNumber);
      if (err) return err;
      floats[0][i] = sample[0];
      floats[1][i] = sample[1];
    }
  }
})();

// events

worker.onerror = function onerror(e) {
  worker.postMessage({ error: { message: e.message, stack: e.stack }});
};

worker.onmessage = function onmessage(ev) {
  worker[ev.data.cmd](ev.data.param);
};

// util

var u = worker.util = {};

u.isMonophonic = function isMonophonic(sample) {
  return !Array.isArray(sample);
};

u.isNumber = function isNumber(sample) {
  if (isNaN(sample)) return new Error('sample is NaN');
  else if (Math.abs(sample) === Infinity) return new Error('sample is Infinity');
};

u.toStereo = function toStereo(fn) {
  var sample = [0, 0];
  return function(t, frame) {
    sample[0] =
    sample[1] = fn(t, frame);
    return sample;
  };
};

u.stereoOr = function stereoOr(sample, fn) {
  return fn(sample[0]) || fn(sample[1]);
};
