(function() {

// dependencies

var test = self.test;
var app = self.app;
var util = app.util;
var LoopBuffer = util.LoopBuffer;

// options

test.options.bail = true;

// specs

describe(".push()", function() {
  var buffer;

  before(function() {
    buffer = new LoopBuffer(3, 3, 4);
  })

  it("should add a part at index 0", function() {
    var part = new Float32Array([1,2,3]);
    buffer.push(part);
    assert(part === buffer.parts[0]);
    assert(1 === buffer.index);
  })

  it("should add a part at index 1", function() {
    var part = new Float32Array([4,5,6]);
    buffer.push(part);
    assert(part === buffer.parts[1]);
    assert(2 === buffer.index);
  })

  it("should add a part at index 2 and loop", function() {
    var part = new Float32Array([7,8,9]);
    buffer.push(part);
    assert(part === buffer.parts[2]);
    assert(0 === buffer.index);
  })

  it("should add a part at index 0", function() {
    var part = new Float32Array([10,11,12]);
    buffer.push(part);
    assert(part === buffer.parts[0]);
    assert(1 === buffer.index);
  })
})

describe(".read()", function() {
  it("should start reading when a bar is complete", function() {
    var buffer = new LoopBuffer(3, 3, 4);
    buffer.push(new Float32Array([1,2]));
    var slice = buffer.read(2);
    assert(null === slice);
    buffer.push(new Float32Array([3]));
    var slice = buffer.read(2);
    assert('1,2' === join(slice));
    var slice = buffer.read(2);
    assert('3,1' === join(slice));
    var slice = buffer.read(6);
    assert('2,3,1,2,3,1' === join(slice));
  })
})

describe(".read() in smaller than part chunks", function() {
  var buffer;

  before(function() {
    buffer = new LoopBuffer(3, 3, 4);
    buffer.push(new Float32Array([1,2,3]));
    buffer.push(new Float32Array([4,5,6]));
    buffer.push(new Float32Array([7,8,9]));
  })

  it("should read chunk 1", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);
    assert('1,2' === join(slice));
  })

  it("should read chunk 2", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);
    assert('3,4' === join(slice));
  })

  it("should read chunk 3", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);
    assert('5,6' === join(slice));
  })

  it("should read chunk 4", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);
    assert('7,8' === join(slice));
  })

  it("should read chunk 5 and rewind 2 bars", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);
    assert('9,4' === join(slice));
  })

  it("should read chunk 6", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);
    assert('5,6' === join(slice));
  })

  it("should read chunk 7", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);
    assert('7,8' === join(slice));
  })
})

describe(".read() in bigger than part chunks", function() {
  var buffer;

  before(function() {
    buffer = new LoopBuffer(3, 3, 4);
    buffer.push(new Float32Array([1,2,3]));
    buffer.push(new Float32Array([4,5,6]));
    buffer.push(new Float32Array([7,8,9]));
  })

  it("should read chunk 1", function() {
    var slice = buffer.read(4);
    assert(4 === slice.length);
    assert('1,2,3,4' === join(slice));
  })

  it("should read chunk 2", function() {
    var slice = buffer.read(4);
    assert(4 === slice.length);
    assert('5,6,7,8' === join(slice));
  })

  it("should read chunk 3 and rewind 2 bars", function() {
    var slice = buffer.read(4);
    assert(4 === slice.length);
    assert('9,4,5,6' === join(slice));
  })

  it("should read chunk 4 and rewind 2 bars", function() {
    var slice = buffer.read(4);
    assert(4 === slice.length);
    assert('7,8,9,4' === join(slice));
  })
})

describe(".read() in exact part chunks", function() {
  var buffer;

  before(function() {
    buffer = new LoopBuffer(3, 3, 4);
    buffer.push(new Float32Array([1,2,3]));
    buffer.push(new Float32Array([4,5,6]));
    buffer.push(new Float32Array([7,8,9]));
  })

  it("should read chunk 1", function() {
    var slice = buffer.read(3);
    assert(3 === slice.length);
    assert('1,2,3' === join(slice));
  })

  it("should read chunk 2", function() {
    var slice = buffer.read(3);
    assert(3 === slice.length);
    assert('4,5,6' === join(slice));
  })

  it("should read chunk 3", function() {
    var slice = buffer.read(3);
    assert(3 === slice.length);
    assert('7,8,9' === join(slice));
  })

  it("should rewind 2 bars and read chunk 4", function() {
    var slice = buffer.read(3);
    assert(3 === slice.length);
    assert('4,5,6' === join(slice));
  })
})

describe("edge cases", function() {
  it("should return null when empty", function() {
    var buffer = new LoopBuffer(3, 3, 4);
    var slice = buffer.read(3);
    assert(null === slice);
  })

  it("should find the biggest power of 2 loop", function() {
    var buffer = new LoopBuffer(4, 2, 4);
    buffer.push(new Float32Array([1,2,3]));
    buffer.push(new Float32Array([4,5,6]));
    var slice = buffer.read(14);
    assert('1,2,3,4,5,6,3,4,5,6,3,4,5,6' === join(slice));
    buffer.push(new Float32Array([7,8,9]));
    var slice = buffer.read(14);
    assert('3,4,5,6,7,8,9,2,3,4,5,6,7,8' === join(slice));
  })

  it("should push at the right position when in loop and loop properly", function() {
    var buffer = new LoopBuffer(3, 3, 4);
    buffer.push(new Float32Array([1,2,3]));
    buffer.push(new Float32Array([4,5,6]));
    buffer.push(new Float32Array([7,8,9]));
    var slice = buffer.read(12);
    assert('1,2,3,4,5,6,7,8,9,4,5,6' === join(slice));
    buffer.push(new Float32Array([10,11,12]));
    var slice = buffer.read(6);
    assert('7,8,9,10,11,12' === join(slice));
    var slice = buffer.read(6);
    assert('7,8,9,10,11,12' === join(slice));
    var slice = buffer.read(3);
    assert('7,8,9' === join(slice));
    buffer.push(new Float32Array([13,14,15]));
    var slice = buffer.read(6);
    assert('10,11,12,13,14,15' === join(slice));
    var slice = buffer.read(6);
    assert('10,11,12,13,14,15' === join(slice));
    buffer.push(new Float32Array([16,17,18]));
    var slice = buffer.read(6);
    assert('10,11,12,13,14,15' === join(slice));
    var slice = buffer.read(6);
    assert('16,17,18,13,14,15' === join(slice));
  })

  it("should push at the right position at smaller chunks when in loop and loop properly", function() {
    var buffer = new LoopBuffer(4, 5, 4);
    buffer.push(new Float32Array([1,2,3]));
    buffer.push(new Float32Array([4,5,6]));
    buffer.push(new Float32Array([7,8,9]));
    buffer.push(new Float32Array([10,11,12]));
    var slice = buffer.read(15);
    assert('1,2,3,4,5,6,7,8,9,10,11,12,3,4,5' === join(slice));
    var slice = buffer.read(8);
    assert('6,7,8,9,10,11,12,3' === join(slice));
    buffer.push(new Float32Array([13,14,15]));
    buffer.push(new Float32Array([16,17,18]));
    var slice = buffer.read(8);
    assert('4,5,6,7,8,9,10,11' === join(slice));
  })
})

/*
describe(".rewind()", function() {
  var buffer;

  beforeEach(function() {
    buffer = new LoopBuffer(3, 3);
    buffer.push(new Float32Array([1,2,3]));
    buffer.push(new Float32Array([4,5,6]));
    buffer.push(new Float32Array([7,8,9]));
  })

  it("should rewind in between parts", function() {
    var slice = buffer.read(5);
    assert(1 === buffer.needle.index);
    assert(2 === buffer.needle.pos);
    buffer.rewind(4);
    assert(0 === buffer.needle.index);
    assert(1 === buffer.needle.pos);
    var slice = buffer.read(3);
    assert(2 === slice[0]);
    assert(3 === slice[1]);
    assert(4 === slice[2]);
  })

  it("should rewind and loop", function() {
    buffer.rewind(2);
    assert(2 === buffer.needle.index);
    assert(1 === buffer.needle.pos);
    var slice = buffer.read(3);
    assert(8 === slice[0]);
    assert(9 === slice[1]);
    assert(1 === slice[2]);
  })

  it("should rewind over and over again", function() {
    buffer.rewind(20);
    assert(2 === buffer.needle.index);
    assert(1 === buffer.needle.pos);
    var slice = buffer.read(3);
    assert(8 === slice[0]);
    assert(9 === slice[1]);
    assert(1 === slice[2]);
  })
})
*/
function assert(expr, msg) {
  if (!expr) throw new Error(msg || 'fail');
}

function join(floats) {
  return [].join.call(floats);
}

})();