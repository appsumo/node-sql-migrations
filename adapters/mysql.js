var mysql = require('mysql');
var config = require('../config.js');
var util = require('../util.js');
var ENSURE_SQL = 'create table if not exists `__migrations__` (id BIGINT NOT NULL, PRIMARY KEY (`id`))';

var _connection = null;

function _getConnection() {
  if (_connection) return _connection;

  _connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  _connection.connect();

  return _connection;
}

function _panic(err) {
  adapter.close();
  util.panic(err);
}

var adapter = {
  open: function() {
    _getConnection();
  },

  close: function() {
    if (_connection) {
      _connection.end();
      _connection = null;
    }
  },

  exec: function(query, values, cb) {
    if (!cb) {
      cb = values;
      values = [];
    }
    if (!_connection) return _panic('Connection not open.  You need to call open() before running any queries.');

    _connection.query(query, values, function(err, result) {
      // We don't want to error on empty query error.
      if (err && err.code !== 'ER_EMPTY_QUERY') _panic(err);
      cb(result)
    });
  },

  appliedMigrations: function(cb) {
    this.ensureMigrationTableExists(function(err) {
      this.exec('select * from __migrations__', function(result) {
        cb(result.map(function(row) {
          return row.id;
        }));
      });
    }.bind(this));
  },

  applyMigration: function(migration, cb) {
    var self = this;
    var sql = util.getSql(migration);
    var sqlQueries = sql.split(';');

    console.log('Applying ' + migration);
    console.log('===============================================');

    function applyMigrationPart() {
      if (!sqlQueries.length) {
        var values = [migration.match(/^(\d)+/)[0]];
        return self.exec('insert into __migrations__ (id) values (?)', values, cb);
      }

      self.exec(sqlQueries.shift(), applyMigrationPart);
    }

    applyMigrationPart();
  },

  clearDatabase: function(cb) {
    this.exec('drop database if exists sumome', function() {
      this.exec('create database if not exists sumome', function() {
        // Reconnect to sumome db now that it is recreated.
        _connection.changeUser({ database: 'sumome' }, cb);
      });
    }.bind(this));
  },

  ensureMigrationTableExists: function(cb) {
    this.exec(ENSURE_SQL, cb)
  }
};

module.exports = adapter;
