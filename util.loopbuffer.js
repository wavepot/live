(function() {

// dependencies

var app = self.app;
var util = app.util;

// exports

util.LoopBuffer = LoopBuffer;

// class

function LoopBuffer(barLength, maxLoopBars) {
  this.bars = map(Array(maxLoopBars), function(){ return new Float32Array(barLength) });
  this.spare = new Float32Array(barLength);

  this.barLength = barLength;
  this.maxLoopBars = maxLoopBars;

  this.index = 0;
  this.pos = 0;
  this.remain = this.barLength;

  this.ahead = 0;
  this.total = 0;

  this.needle = { index: 0, pos: 0, remain: this.barLength };
}

LoopBuffer.prototype.write = function(buffer) {
  var length = buffer.length;
  if (length >= this.remain) {
    this.spare.set(buffer.subarray(0, this.remain), this.pos);
    var rest = buffer.subarray(this.remain);

    // swap
    var temp = this.bars[this.index];
    this.bars[this.index] = this.spare;
    this.spare = temp;

    this.index = (this.index + 1) % this.maxLoopBars;
    this.pos = 0;
    this.remain = this.barLength;

    this.ahead++;
    this.total++;

    this.ahead = Math.min(this.ahead, this.maxLoopBars);
    this.total = Math.min(this.total, this.maxLoopBars);

    return this.write(rest);
  } else {
    this.spare.set(buffer, this.pos);
    this.pos += length;
    this.remain -= length;
  }
};

LoopBuffer.prototype.read = function(bytes, buffers) {
  if (!this.total) return null;

  if (!buffers) {
    buffers = [];
    buffers.bytes = bytes;
  }

  if (bytes >= this.needle.remain) {
    bytes -= this.needle.remain;
    buffers.push(this.bars[this.needle.index].subarray(this.needle.pos));

    if (++this.needle.index > Math.min(this.total, this.maxLoopBars) - 1) {
      //this.ahead = Math.min(this.total, this.maxLoopBars) - 1;
      this.needle.index = 0;
    }

    this.ahead = Math.max(this.ahead - 1, 0);


    this.needle.pos = 0;
    this.needle.remain = this.barLength;

    return this.read(bytes, buffers);
  } else {
    buffers.push(this.bars[this.needle.index].subarray(this.needle.pos, this.needle.pos += bytes));
    this.needle.remain -= bytes;
  }

  var pos = 0;
  var buffer = new Float32Array(buffers.bytes);
  for (var i = 0; i < buffers.length; i++) {
    buffer.set(buffers[i], pos);
    pos += buffers[i].length;
  }

  return buffer;
};

// utils

function map(array, fn) {
  for (var i = 0; i < array.length; i++) {
    array[i] = fn(array[i]);
  }
  return array;
}

})();