(function() {

// dependencies

var app = self.app;
var util = app.util;
var LoopBuffer = util.LoopBuffer;

// specs

describe("when running a test", function() {
  it("should pass", function() {
    console.log('yup');
  });
});

describe("when running another test", function() {
  before(function() {
    console.log('this should run before');
  });
  it("should pass", function() {
    console.log('yup');
  });
  it("should fail", function() {
    throw new Error('oh crap');
  });
});

})();