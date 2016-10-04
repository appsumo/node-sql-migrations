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

function _splitIntoQueries(sql) {
  if (!sql) return [];
  return sql.split(/;\n/g);
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

    console.log(query)
    _connection.query(query, values, function(err, result) {
      // We don't want to error on empty query error.
      if (err && err.code !== 'ER_EMPTY_QUERY') _panic(err);
      cb(result)
    });
  },

  // This is to split up sql files into individual commands.  It doesn't take
  // values because there isn't a specified query to give them to.
  batchExec: function(batchSql, cb) {
    var self = this;
    var sqlQueries = _splitIntoQueries(batchSql);

    function applyPart() {
      if (!sqlQueries.length) {
        return cb();
      }

      self.exec(sqlQueries.shift(), applyPart);
    }

    applyPart();
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

    console.log('Applying ' + migration);
    console.log('===============================================');

    this.batchExec(sql, function() {
      var values = [migration.match(/^(\d)+/)[0]];
      return self.exec('insert into __migrations__ (id) values (?)', values, cb);
    });
  },

  // Takes a seed environment to run in fixture/seeds/. e.g. 'default'
  applySeed: function(seed, callback) {
    var sql = util.getSeedSql(seed);
    this.batchExec(sql, callback);
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
