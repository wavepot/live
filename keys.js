(function() {

// dependencies

var app = self.app;
var keys = app.keys;
var k = app.keys;
var u = app.util;

// properties

k.Tab = 9;

// register handlers

for (var i = 1000; i--;) k[i] = u.noop; //u.push(u.pull('which'), u.log);

keys[k.Tab] = u.insertTab;

})();