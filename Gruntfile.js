var migrator = require('./index.js');

module.exports = function(grunt) {
  var dbConfig = {
    host: '127.0.0.1',
    user: 'sumome',
    password: '',
    database: 'sumome',
  };

  grunt.registerTask('db:create-migration', function() {
    var done = this.async();
    migrator.createMigration(dbConfig, done);
  });

  grunt.registerTask('db:migrate', function() {
    var done = this.async();
    migrator.migrate(dbConfig, done);
  });

  grunt.registerTask('db:rebuild', function() {
    var done = this.async();
    migrator.rebuild(dbConfig, done);
  });
};
