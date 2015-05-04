(function() {

// dependencies

var app = self.app;
var util = app.util;
var u = util;

// exports

util.LoopBuffer = LoopBuffer;

// class

function LoopBuffer(length, bufferSize, numBuffersPerBeat) {
  this.length = length;
  this.bufferSize = bufferSize;
  this.numBuffersPerBeat = numBuffersPerBeat;
  this.current = null;
  this.buffer = null;
  this.needle = { index: 0, pos: 0 };
  this.index = 0;
  this.ahead = 0;
  this.total = 0;
  this.spare = u.map(Array(numBuffersPerBeat), u.toFloat32Array(bufferSize));
  this.beats = u.map(Array(length), function() {
    return u.map(Array(numBuffersPerBeat), u.toFloat32Array(bufferSize));
  });
}

LoopBuffer.prototype.acquire = function acquire() {
  return u.map(this.spare, u.toArrayBuffer);
};

LoopBuffer.prototype.write = function write(buffers) {
  this.spare = u.map(buffers, u.toFloat32Array());
  this.spare = u.swap(this.spare, this.beats, this.index);
  this.index = (this.index + 1) % this.length;
  this.ahead++;
  this.total++;
};

LoopBuffer.prototype.read = function read() {
  if (!this.total) return null;
  this.current = this.beats[this.needle.index];
  this.buffer = this.current[this.needle.pos];
  if (++this.needle.pos === this.numBuffersPerBeat) {
    this.needle.index = (this.needle.index + 1) % Math.min(this.total, this.length);
    this.needle.pos = 0;
    this.ahead = Math.max(0, this.ahead - 1);
  }
  return this.buffer;
};

})();