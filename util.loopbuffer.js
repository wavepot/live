(function() {

// dependencies

var app = self.app;
var util = app.util;

// exports

util.LoopBuffer = LoopBuffer;

// class

function LoopBuffer(length, barLength, maxLoopBars) {
  this.length = length;
  this.parts = Array(length);
  this.index = 0;
  this.ahead = 0;
  this.total = 0;
  this.pushed = 0;
  this.needle = { index: 0, pos: 0 };
  this.barLength = barLength;
  this.maxLoopBars = maxLoopBars;
}

LoopBuffer.prototype.push = function push(buffer) {
  if (this.parts[this.index]) {
    this.total -= this.parts[this.index].length;
  }
  this.parts[this.index] = buffer;
  this.index = (this.index + 1) % this.length;
  this.ahead += buffer.length;
  this.total += buffer.length;
  this.total = Math.min(this.total, this.barLength * this.maxLoopBars);
  this.pushed++;
};

LoopBuffer.prototype.read = function read(bytes, ranges) {
  if (!this.canLoop()) {
    if (this.ahead < bytes) return null;
    if (this.ahead < this.barLength) return null;
  }

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
    bytes -= range.length;
  } else {
    range = {
      index: this.needle.index,
      start: this.needle.pos,
      end: part.length,
      length: 0
    };

    range.length = range.end - range.start;
    bytes -= range.length;

    this.needle.index = (this.needle.index + 1) % this.length;
    this.needle.pos = 0;

    if (this.needle.index === this.index) {
      if (bytes && !this.canLoop()) return null;
      this.loop();
    }
  }

  ranges.push(range);
  this.ahead -= range.length;
  //this.ahead = Math.max(0, this.ahead);

  if (bytes) {
    return this.read(bytes, ranges);
  }

  return this.join(ranges);
};


LoopBuffer.prototype.loop = function() {
  //this.index = this.needle.index;
  var x = Math.round(this.total / this.barLength);
  while ((x & (x - 1)) != 0) x--;
  return this.rewind(Math.round(x * this.barLength + 1));
};

LoopBuffer.prototype.canLoop = function() {
  return this.total >= this.barLength;
};

LoopBuffer.prototype.rewind = function rewind(bytes) {
  if (this.needle.pos + 1 < bytes) {
    bytes -= this.needle.pos + 1;
    this.ahead += this.needle.pos + 1;
    this.moveNeedleBack();
  } else {
    this.needle.pos -= bytes - 1;
    this.ahead += bytes;
    bytes = 0;
  }
  if (bytes) return this.rewind(bytes);
  else return true;
};

LoopBuffer.prototype.moveNeedleBack = function() {
  this.needle.index -= 1;
  if (this.needle.index < 0) {
    this.needle.index = Math.min(this.pushed, this.length) - 1;
  }
  this.needle.pos = this.parts[this.needle.index].length - 1;
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