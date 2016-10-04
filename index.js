var config = require('./config.js');

function configWrapper(command) {
  return function(cfg, done) {
    cfg = cfg || {};

    for (var k in cfg) {
      config[k] = cfg[k];
    }

    console.log('Config:');
    console.log(config);

    if (command) command(done);
  }
}

module.exports = {
  createMigration: configWrapper(require('./cmds/create_migration.js')),
  migrate: configWrapper(require('./cmds/migrate.js')),
  rebuild: configWrapper(require('./cmds/rebuild.js')),
  seed: configWrapper(require('./cmds/seed.js')),
};
