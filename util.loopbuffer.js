(function() {

// dependencies

var app = self.app;
var util = app.util;

// exports

util.LoopBuffer = LoopBuffer;

// class

function LoopBuffer(length) {
  this.length = length;
  this.clear();
}

LoopBuffer.prototype.clear = function clear() {
  this.elements = Array(this.length);
  this.current = null;
  this.first = 0;
  this.last = 0;
  this.size = 0;
  this.hasFilled = false;
};

LoopBuffer.prototype.shift = function shift() {
  if (this.isEmpty()) {
    if (this.hasFilled) this.loop();
    else return null;
  }

  this.current = this.elements[this.first];
  this.first = ++this.first % this.length;
  this.size--;

  if (!this.hasFilled && this.first === 0) {
    this.hasFilled = true;
  }

  return this.current;
};

LoopBuffer.prototype.push = function push(element) {
  this.last = (this.first + this.size) % this.length;

  this.elements[this.last] = element;
  
  if (this.isFull()) {
    this.first = ++this.first % this.length;
  } else {
    this.size++;
  }

  return this.size;
};

LoopBuffer.prototype.loop = function loop() {
  this.size = this.length;
  this.first = ++this.first % this.length;
  this.last = (this.first + this.size) % this.length;
};

LoopBuffer.prototype.isEmpty = function isEmpty() {
  return this.size === 0;
};

LoopBuffer.prototype.isFull = function isFull() {
  return this.size === this.length;
};

})();