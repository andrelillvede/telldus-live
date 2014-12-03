Package.describe({
  name: 'telldus-live',
  summary: 'Meteor package for telldus-live API',
  version: '0.0.0',
  git: ''
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('telldus-live.js', 'server');
  api.export('Telldus', 'server')
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('telldus-live');
  api.addFiles('telldus-live-tests.js');

});

Npm.depends({
  oauth: '0.9.12',
});
