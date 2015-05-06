
// dependencies

var worker = self;
var app = self.app = worker;
var u = app.util = {};
importScripts('util.js');

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

worker.rpc = function rpc(remote) {
  worker[remote.fn](remote.payload, callback);

  function callback(error, payload, transferables) {
    worker.postMessage({
      id: remote.id,
      error: error && { message: error.message, stack: error.stack },
      payload: payload,
    }, transferables);
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

  return function bufferAhead(buffers, cb) {
    if (worker.fn) {
      fn = worker.fn;
      worker.fn = null;
    }

    if (!fn) return cb(new Error('no dsp function to process'));

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
        return cb(err);
      }

      buffers[0][x] = floats[0].buffer;
      buffers[1][x] = floats[1].buffer;
    }

    floats = null;

    worker.frame = frame;
    worker.sample = sample;

    cb(null, buffers, buffers[0].concat(buffers[1]))

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
