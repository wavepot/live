(function() {

// dependencies

var app = self.app;
var util = app.util;
var LoopBuffer = util.LoopBuffer;

// specs

describe(".push()", function() {
  var buffer;

  before(function() {
    buffer = new LoopBuffer(3);
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

describe(".read() in smaller than part chunks", function() {
  var buffer;

  before(function() {
    buffer = new LoopBuffer(3);
    buffer.push(new Float32Array([1,2,3]));
    buffer.push(new Float32Array([4,5,6]));
    buffer.push(new Float32Array([7,8,9]));
  })

  it("should read chunk 1", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);

    assert(1 === slice[0]);
    assert(2 === slice[1]);
  })

  it("should read chunk 2", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);

    assert(3 === slice[0]);
    assert(4 === slice[1]);
  })

  it("should read chunk 3", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);

    assert(5 === slice[0]);
    assert(6 === slice[1]);
  })

  it("should read chunk 4", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);

    assert(7 === slice[0]);
    assert(8 === slice[1]);
  })

  it("should read chunk 5 and loop", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);

    assert(9 === slice[0]);
    assert(1 === slice[1]);
  })

  it("should read chunk 6", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);

    assert(2 === slice[0]);
    assert(3 === slice[1]);
  })

  it("should read chunk 7", function() {
    var slice = buffer.read(2);
    assert(2 === slice.length);

    assert(4 === slice[0]);
    assert(5 === slice[1]);
  })
})

describe(".read() in bigger than part chunks", function() {
  var buffer;

  before(function() {
    buffer = new LoopBuffer(3);
    buffer.push(new Float32Array([1,2,3]));
    buffer.push(new Float32Array([4,5,6]));
    buffer.push(new Float32Array([7,8,9]));
  })

  it("should read chunk 1", function() {
    var slice = buffer.read(4);
    assert(4 === slice.length);

    assert(1 === slice[0]);
    assert(2 === slice[1]);
    assert(3 === slice[2]);
    assert(4 === slice[3]);
  })

  it("should read chunk 2", function() {
    var slice = buffer.read(4);
    assert(4 === slice.length);

    assert(5 === slice[0]);
    assert(6 === slice[1]);
    assert(7 === slice[2]);
    assert(8 === slice[3]);
  })

  it("should read chunk 3 and loop", function() {
    var slice = buffer.read(4);
    assert(4 === slice.length);

    assert(9 === slice[0]);
    assert(1 === slice[1]);
    assert(2 === slice[2]);
    assert(3 === slice[3]);
  })

  it("should read chunk 4", function() {
    var slice = buffer.read(4);
    assert(4 === slice.length);

    assert(4 === slice[0]);
    assert(5 === slice[1]);
    assert(6 === slice[2]);
    assert(7 === slice[3]);
  })
})

describe(".read() in exact part chunks", function() {
  var buffer;

  before(function() {
    buffer = new LoopBuffer(3);
    buffer.push(new Float32Array([1,2,3]));
    buffer.push(new Float32Array([4,5,6]));
    buffer.push(new Float32Array([7,8,9]));
  })

  it("should read chunk 1", function() {
    var slice = buffer.read(3);
    assert(3 === slice.length);

    assert(1 === slice[0]);
    assert(2 === slice[1]);
    assert(3 === slice[2]);
  })

  it("should read chunk 2", function() {
    var slice = buffer.read(3);
    assert(3 === slice.length);

    assert(4 === slice[0]);
    assert(5 === slice[1]);
    assert(6 === slice[2]);
  })

  it("should read chunk 3", function() {
    var slice = buffer.read(3);
    assert(3 === slice.length);

    assert(7 === slice[0]);
    assert(8 === slice[1]);
    assert(9 === slice[2]);
  })

  it("should loop and read chunk 4", function() {
    var slice = buffer.read(3);
    assert(3 === slice.length);

    assert(1 === slice[0]);
    assert(2 === slice[1]);
    assert(3 === slice[2]);
  })
})

describe(".rewind()", function() {
  var buffer;

  beforeEach(function() {
    buffer = new LoopBuffer(3);
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

function assert(expr, msg) {
  if (!expr) throw new Error(msg || 'fail');
}

})();