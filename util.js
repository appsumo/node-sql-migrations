var fs = require('fs');
var path = require('path');
var config = require('./config.js');

module.exports = {
  panic: function(err) {
    console.error('ERROR:', err);
    process.exit(1);
  },

  getMigrationsList: function() {
    return fs.readdirSync(config.migrationsDir);
  },

  // Gets the pending migration to run.
  getPending: function(migrationFileNames, migratedIds) {
    var pending = [];

    migrationFileNames.forEach(function(migration) {
      // Parse id to int so matches the data type of migratedIds.
      var id = parseInt(migration.match(/^(\d+)/)[0], 10);
      var hasRunMigration = !!~migratedIds.indexOf(id);
      var isUpMigration = !!migration.match(/^\d+\_up.*$/);

      if (!hasRunMigration && isUpMigration) {
        pending.push(migration);
      }
    });

    return pending;
  },

  getSql: function(migration) {
    var migrationPath = path.join(config.migrationsDir, migration);
    return fs.readFileSync(migrationPath).toString();
  },

  getSeedSql: function(seed) {
    // default.sql is temporary and will more than likely add many seed files
    // in the future.
    var seedPath = path.join(config.seedDir, seed + '.sql');
    return fs.readFileSync(seedPath).toString();
  }
};
