var chalk = require('chalk');
var util = require('../util.js');
var adapter = require('../adapters/mysql.js');
var dbMiddleware = require('../middleware/db.js');

function migrate(done) {
  adapter.appliedMigrations(function(ids) {
    var migrationsList = util.getMigrationsList();
    var pending = util.getPending(migrationsList, ids);

    if (pending.length) {
      console.log('Pending migrations:');
      pending.forEach(function(m) {
        console.log(chalk.green('>>'), m);
      });
    } else {
      console.log('No pending migrations');
    }

    function apply() {
      // base case
      if (!pending.length) {
        console.log('done');
        return done();
      }

      adapter.applyMigration(pending.shift(), apply);
    }

    apply();
  });
};

module.exports = dbMiddleware(migrate);
