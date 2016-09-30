var config = require('../config.js');
var adapter = require('../adapters/mysql.js');

module.exports = function(next) {
  return function(done) {
    adapter.open();

    if (next) next(function() {
      adapter.close();
      done();
    });
  };
};
