var chalk = require('chalk');
var util = require('../util.js');
var adapter = require('../adapters/mysql.js');
var dbMiddleware = require('../middleware/db.js');
var migrateCommand = require('./migrate.js');

function rebuild(done) {
  console.log('Clearing database...');

  adapter.clearDatabase(function() {
    console.log('Database cleared.');
    migrateCommand(done);
  });
};

module.exports = dbMiddleware(rebuild);
