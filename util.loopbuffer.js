(function() {

// dependencies

var app = self.app;
var util = app.util;

// exports

util.LoopBuffer = LoopBuffer;

// class

function LoopBuffer(length, loopWidth) {
  this.length = length;
  this.parts = Array(length);
  this.loopWidth = loopWidth;
  this.index = 0;
  this.ahead = 0;
  this.total = 0;
  this.needle = {
    index: 0,
    pos: 0
  };
}

LoopBuffer.prototype.push = function push(buffer) {
  this.parts[this.index] = buffer;
  this.index = (this.index + 1) % this.length;
  this.ahead += buffer.length;
  this.total += buffer.length;
  this.total = Math.min(this.total, this.loopWidth * 4);
};

LoopBuffer.prototype.read = function read(bytes, ranges) {
  if (this.ahead <= 0) this.maybeRewind();

  var part, range;

  if (!ranges) {
    ranges = [];
    ranges.bytes = bytes;
  }

  part = this.parts[this.needle.index];

  if (!part) return null;

  if (part.length - this.needle.pos > bytes) {
    range = {
      index: this.needle.index,
      start: this.needle.pos,
      end: this.needle.pos += bytes,
      length: bytes
    };

    ranges.push(range);

    this.ahead -= range.length;

    bytes = 0;
  } else {
    range = {
      index: this.needle.index,
      start: this.needle.pos,
      end: part.length,
      length: 0
    };

    range.length = range.end - range.start;

    ranges.push(range);

    bytes -= range.length;
    this.ahead -= range.length;

    this.needle.index = (this.needle.index + 1) % this.length;
    this.needle.pos = 0;
  }

  if (bytes) {
    if (this.ahead < bytes) this.maybeRewind();
    return this.read(bytes, ranges);
  }

  return this.join(ranges);
};

LoopBuffer.prototype.maybeRewind = function() {
  //this.total = Math.round(Math.min(this.total, this.loopWidth * 4));
  if (this.total >= this.loopWidth) {
    var x = Math.round(this.total / this.loopWidth);
    while ((x & (x - 1)) != 0) x--; // need a power of 2
    this.rewind(Math.round(x * this.loopWidth));
  } else {
    return null;
  }
};

LoopBuffer.prototype.rewind = function rewind(bytes) {
  if (this.needle.pos + 1 < bytes) {
    bytes -= this.needle.pos + 1;

    this.needle.index -= 1;

    if (this.needle.index < 0) this.needle.index = this.length - 1;
    this.needle.pos = this.parts[this.needle.index].length - 1;
    this.ahead += this.needle.pos;
  } else {
    this.needle.pos -= bytes - 1;
    this.ahead += bytes;
    bytes = 0;
  }
  if (bytes) return this.rewind(bytes);
};

LoopBuffer.prototype.join = function join(ranges) {
  var part, range, pos = 0;

  var buffer = new Float32Array(ranges.bytes);

  for (var i = 0; i < ranges.length; i++) {
    range = ranges[i];
    part = this.parts[range.index];
    buffer.set(part.subarray(range.start, range.end), pos);
    pos += range.end - range.start;
  }

  return buffer;
};

})();