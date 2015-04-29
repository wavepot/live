(function() {

// test container

var test = self;

// properties

test.el = document.getElementById('test');
test.bootTimeout = null;
test.groups = [];
test.group = null;
test.results = {
  total: 0,
  passed: 0,
  failed: 0
};

// methods

test.print = function print(msg) {
  test.el.textContent += msg;
};

test.boot = function boot() {
  test.groups.forEach(function(group) {
    test.print(group.msg + ':\n');
    try {
      group.before();
    } catch(e) {
      test.print('!FAIL!\n');
      test.print(e.message + '\n' + e.stack + '\n');
      test.results.total += group.cases.length;
      test.results.failed += group.cases.length;
      return;
    }
    group.cases.forEach(function(c) {
      test.print('  ' + c.msg + ' -- ');
      test.results.total++;
      try {
        group.beforeEach();
        c.fn();
        group.afterEach();
        test.print('ok\n');
        test.results.passed++;
      } catch(e) {
        test.print('!FAIL!\n');
        test.print(e.message + '\n' + e.stack + '\n');
        test.results.failed++;
      }
    });
    try {
      group.after();
    } catch(e) {
      test.print('!FAIL!\n');
      test.print(e.message + '\n' + e.stack + '\n');
      return;
    }
    test.print('\n');
  });
  test.print(test.results.total + ' tests complete\n');
  test.print(test.results.passed + ' passed\n');
  test.print(test.results.failed + ' failed\n');
};

test.describe = function describe(msg, fn) {
  clearTimeout(test.bootTimeout);
  test.bootTimeout = setTimeout(test.boot, 0);
  test.groups.push(test.group = {
    msg: msg,
    fn: fn,
    cases: [],
    before: noop,
    beforeEach: noop,
    after: noop,
    afterEach: noop
  });
  test.group.fn();
};

test.it = function it(msg, fn) {
  test.group.cases.push({
    msg: msg,
    fn: fn
  });
};

test.before = function before(fn) { test.group.before = fn };
test.beforeEach = function beforeEach(fn) { test.group.beforeEach = fn };
test.after = function after(fn) { test.group.after = fn };
test.afterEach = function afterEach(fn) { test.group.afterEach = fn };

function noop() {/* noop */}

})();