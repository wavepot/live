(function() {

// dependencies

var test = self.test;
var app = self.app;
var util = app.util;
var LoopBuffer = util.LoopBuffer;

// options

test.options.bail = true;

// specs
/*
describe(".write()", function() {
  var buffer;

  beforeEach(function() {
    buffer = new LoopBuffer(4, 2);
  })

  it("should write in spare", function() {
    var part = new Float32Array([1,2,3]);
    buffer.write(part);
    assert('1,2,3,0' === join(buffer.spare));
  })

  it("should swap spare with bar", function() {
    var part = new Float32Array([1,2,3]);
    buffer.write(part);
    assert('1,2,3,0' === join(buffer.spare));

    var part = new Float32Array([4,5,6]);
    buffer.write(part);
    assert('1,2,3,4' === join(buffer.bars[0]));
    assert('5,6,0,0' === join(buffer.spare));

    var part = new Float32Array([7,8,9]);
    buffer.write(part);
    assert('1,2,3,4' === join(buffer.bars[0]));
    assert('5,6,7,8' === join(buffer.bars[1]));
    assert('9,0,0,0' === join(buffer.spare));
  })

  it("should loop when full", function() {
    var part = new Float32Array([1,2,3,4,5,6,7,8,9,10]);
    buffer.write(part);
    assert('1,2,3,4' === join(buffer.bars[0]));
    assert('5,6,7,8' === join(buffer.bars[1]));
    var part = new Float32Array([11,12,13,14]);
    buffer.write(part);
    assert('9,10,11,12' === join(buffer.bars[0]));
    assert('5,6,7,8' === join(buffer.bars[1]));
    var part = new Float32Array([15,16,17,18]);
    buffer.write(part);
    assert('9,10,11,12' === join(buffer.bars[0]));
    assert('13,14,15,16' === join(buffer.bars[1]));
  })
})

describe(".read()", function() {
  var buffer;

  beforeEach(function() {
    buffer = new LoopBuffer(4, 2);
  })

  it("should return null when empty", function() {
    var slice = buffer.read(2);
    assert(null === slice);
  })

  it("should return null when no full bar", function() {
    var part = new Float32Array([1,2,3]);
    buffer.write(part);
    var slice = buffer.read(2);
    assert(null === slice);
  })

  it("should return slice when at least a full bar", function() {
    var part = new Float32Array([1,2,3,4,5,6]);
    buffer.write(part);
    var slice = buffer.read(2);
    assert('1,2' === join(slice));
    var slice = buffer.read(2);
    assert('3,4' === join(slice));
  })

  it("should loop when not all bars full", function() {
    var part = new Float32Array([1,2,3,4,5,6]);
    buffer.write(part);
    var slice = buffer.read(3);
    assert('1,2,3' === join(slice));
    var slice = buffer.read(3);
    assert('4,1,2' === join(slice));
  })

  it("should properly report ahead", function() {
    var part = new Float32Array([1,2,3,4,5,6]);
    buffer.write(part);
    var slice = buffer.read(3);
    assert('1,2,3' === join(slice));
    assert(1 === buffer.ahead);
    var slice = buffer.read(3);
    assert('4,1,2' === join(slice));
    assert(0 === buffer.ahead);
    var part = new Float32Array([7,8,9,10,11,12]);
    buffer.write(part);
    assert(2 === buffer.ahead);
    var slice = buffer.read(3);
    assert('11,12,5' === join(slice));
    assert(1 === buffer.ahead);
    var slice = buffer.read(7);
    assert('6,7,8,9,10,11,12' === join(slice));
    assert(0 === buffer.ahead);
  })
})

describe("case #1", function() {
  var buffer;

  beforeEach(function() {
    buffer = new LoopBuffer(4, 4);
  })

  it("should work as expected", function() {
    var part = new Float32Array([1,2]);
    buffer.write(part);
    var slice = buffer.read(2);
    assert(null === slice);

    var part = new Float32Array([3,4]);
    buffer.write(part);
    var slice = buffer.read(2);
    assert('1,2' === join(slice));

    var part = new Float32Array([5,6,7,8,9,10]);
    buffer.write(part);
    var slice = buffer.read(2);
    assert('3,4' === join(slice));
    var slice = buffer.read(2);
    assert('5,6' === join(slice));
    var slice = buffer.read(2);
    assert('7,8' === join(slice));
    var slice = buffer.read(2);
    assert('1,2' === join(slice));

    var part = new Float32Array([11,12]);
    buffer.write(part);

    var slice = buffer.read(10);
    assert('3,4,5,6,7,8,9,10,11,12' === join(slice));

    var slice = buffer.read(10);
    assert('1,2,3,4,5,6,7,8,9,10' === join(slice));

    var part = new Float32Array([13,14,15,16,17,18]);
    buffer.write(part);

    var slice = buffer.read(10);
    assert('11,12,13,14,15,16,1,2,3,4' === join(slice));

    var part = new Float32Array([19,20,21,22]);
    buffer.write(part);

    var slice = buffer.read(10);
    assert('5,6,7,8,9,10,11,12,13,14' === join(slice));
    var part = new Float32Array([23]);
    buffer.write(part);
    var part = new Float32Array([24]);
    buffer.write(part);
    var part = new Float32Array([25]);
    buffer.write(part);
    var part = new Float32Array([26]);
    buffer.write(part);

    var slice = buffer.read(10);
    assert('15,16,17,18,19,20,21,22,23,24' === join(slice));

    var part = new Float32Array([27,28,29]);
    buffer.write(part);

    var slice = buffer.read(3);
    assert('25,26,27' === join(slice));

    var slice = buffer.read(3);
    assert('28,13,14' === join(slice));
  })
})

describe("case #2", function() {
  var buffer;

  beforeEach(function() {
    buffer = new LoopBuffer(3, 3);
  })

  it("should work as expected", function() {
    var part = new Float32Array([1,2]);
    buffer.write(part);
    var slice = buffer.read(2);
    assert(null === slice);

    var part = new Float32Array([3,4]);
    buffer.write(part);
    var slice = buffer.read(2);
    assert('1,2' === join(slice));
    var slice = buffer.read(2);
    assert('3,1' === join(slice));

    var part = new Float32Array([5,6]);
    buffer.write(part);
    var part = new Float32Array([7,8]);
    buffer.write(part);
    var part = new Float32Array([9,10]);
    buffer.write(part);

    var slice = buffer.read(2);
    assert('2,3' === join(slice));

    var part = new Float32Array([11,12]);
    buffer.write(part);

    var slice = buffer.read(2);
    assert('4,5' === join(slice));
    var slice = buffer.read(2);
    assert('6,7' === join(slice));
    var slice = buffer.read(2);
    assert('8,9' === join(slice));
    var slice = buffer.read(2);
    assert('10,11' === join(slice));
    var slice = buffer.read(2);
    assert('12,4' === join(slice));
  })
})

describe("case #3", function() {
  var buffer;

  beforeEach(function() {
    buffer = new LoopBuffer(5, 2);
  })

  it("should work as expected", function() {
    var part = new Float32Array([1,2]);
    buffer.write(part);
    var part = new Float32Array([3,4]);
    buffer.write(part);
    var part = new Float32Array([5,6]);
    buffer.write(part);
    var slice = buffer.read(3);
    assert('1,2,3' === join(slice));
    var slice = buffer.read(3);
    assert('4,5,1' === join(slice));
    var slice = buffer.read(3);
    assert('2,3,4' === join(slice));
    var slice = buffer.read(3);
    assert('5,1,2' === join(slice));
    var part = new Float32Array([7,8]);
    buffer.write(part);
    var part = new Float32Array([9,10]);
    buffer.write(part);
    var part = new Float32Array([11,12]);
    buffer.write(part);
    var slice = buffer.read(3);
    assert('3,4,5' === join(slice));
    var slice = buffer.read(3);
    assert('6,7,8' === join(slice));
    var slice = buffer.read(3);
    assert('9,10,1' === join(slice));
  })
})
*/
/*
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
*/
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