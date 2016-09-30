var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var prompt = require('prompt');
var config = require('../config.js');
var util = require('../util.js');

var promptSchema = {
  properties: {
    name: {
      description: 'Enter migration name eg. \'add json column to listbuilder popups\'',
      pattern: /^[a-zA-Z\s0-9]+$/,
      message: 'Name must be letters, numbers, and spaces.',
      required: true,
    }
  }
}

function _getMigrationName(done) {
  prompt.start();
  prompt.get(promptSchema, function(err, result) {
    if (err) util.panic(err);
    var name = result.name.toLowerCase().replace(/\s+/g, '_');
    done(name);
  });
}

function createMigration(done) {
  var up, down, ts = Date.now();

  _getMigrationName(function(migrationName) {
    mkdirp.sync(config.migrationsDir);

    up = ts + '_up_' + migrationName + '.sql';
    //down = ts + '_down_' + migrationName + '.sql';

    up = path.resolve(config.migrationsDir, up);
    //down = path.resolve(cfg.migrationsDir, down);

    console.log(up);
    //console.log(down);

    fs.openSync(up, 'w');
    //fs.openSync(down, 'w');

    done();
  });
};

module.exports = createMigration;
