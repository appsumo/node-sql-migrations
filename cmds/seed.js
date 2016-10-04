var chalk = require('chalk');
var adapter = require('../adapters/mysql.js');
var dbMiddleware = require('../middleware/db.js');

function seed(done) {
  console.log(chalk.yellow('>>'), 'Apply \'default\' seed...');

  adapter.applySeed('default', function() {
    console.log(chalk.green('>>'), 'done');
    done();
  });
};

module.exports = dbMiddleware(seed);
