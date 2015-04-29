(function() {

// dependencies

var app = self.app;
var util = app.util;

// exports

util.LoopBuffer = LoopBuffer;

// class

function LoopBuffer(length) {
  this.length = length;
  this.parts = Array(length);
  this.index = 0;
  this.needle = {
    index: 0,
    pos: 0
  };
}

LoopBuffer.prototype.push = function push(buffer) {
  this.parts[this.index] = buffer;
  this.index = (this.index + 1) % this.length;
};

LoopBuffer.prototype.read = function read(bytes, ranges) {
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
      end: this.needle.pos += bytes
    };

    ranges.push(range);

    bytes = 0;
  } else {
    range = {
      index: this.needle.index,
      start: this.needle.pos,
      end: part.length
    };

    ranges.push(range);

    bytes -= range.end - range.start;

    this.needle.index = (this.needle.index + 1) % this.length;
    this.needle.pos = 0;
  }

  if (bytes) return this.read(bytes, ranges);

  return this.join(ranges);
};

LoopBuffer.prototype.rewind = function rewind(bytes) {
  if (this.needle.pos + 1 < bytes) {
    bytes -= this.needle.pos;

    this.needle.index -= 1;

    if (this.needle.index < 0) this.needle.index = this.length - 1;
    this.needle.pos = this.parts[this.needle.index].length - 1;
  } else {
    this.needle.pos -= bytes - 1;
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