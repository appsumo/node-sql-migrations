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
    var sql = util.getSql(migration);

    this.exec(sql, function(result) {
      console.log('Applying ' + migration);
      console.log('===============================================');

      var values = [migration.match(/^(\d)+/)[0]];
      this.exec('insert into __migrations__ (id) values (?)', values, cb);
    }.bind(this));
  },

  clearDatabase: function(cb) {
    var self = this;

    self.exec('drop database if exists sumome', function() {
      self.exec('create database if not exists sumome', function() {
        // Reconnect to sumome db now that it is recreated.
        _connection.changeUser({ database: 'sumome' }, cb);
      });
    });
  },

  ensureMigrationTableExists: function(cb) {
    this.exec(ENSURE_SQL, cb)
  }
};

module.exports = adapter;
