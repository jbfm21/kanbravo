'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
        DEBUG: false, // when set to true, the plugin will log info to console. Useful for bug reporting and issue debugging
        pattern: ['gulp-*', 'gulp.*', 'browserify', 'watchify', 'vinyl-source-stream', 'vinyl-buffer'], // the glob(s) to search for
        scope: ['dependencies', 'devDependencies'], // which keys in the config to look within
        lazy: false, // whether the plugins should be lazy loaded on demand
        rename: {
            'gulp-util': 'gutil',
            'vinyl-source-stream': 'vinylSource'
        }
    }
);

// Default error handler. Sends to browser-sync, and logs to console.
var errorHandler = function (err) {
  plugins.util.log(err.toString());

  if (process.argv.indexOf('--fail') !== -1) {
    throw new Error('Failed');
  }
};


var _getTask = function(basePath, name, options, callback)
{
  if (typeof options !== 'object') {
    options = {};
  }

  if (typeof options.onError !== 'function') {
    options.onError = errorHandler;
  }

  if (typeof options.rev !== 'boolean') {
    options.rev = (process.env.NODE_ENV === 'production');
  }

  if (typeof options.manifest !== 'string') {
    options.manifest = process.env.MANIFEST_DEST;
  }

  // This means that you don't have to call this.emit('end') yourself
  var actualErrorHandler = options.onError;
  options.onError = function () {
    actualErrorHandler.apply(this, arguments);
    this.emit('end');
  };

  return require(basePath + name)(gulp, plugins, options, callback);
};


module.exports.getBackEndTask = function (name, options, callback)
{
  return _getTask('./backend/', name, options, callback);
};

module.exports.getCommonTask = function (name, options, callback)
{
  return _getTask('./common/', name, options, callback);
};

module.exports.getFrontendTask = function (name, options, callback)
{
  return _getTask('./frontend/', name, options, callback);
};


/**
 * Set default error handler.
 *
 * @param newHandler
 */
module.exports.setErrorHandler = function (newHandler) {
  errorHandler = newHandler;
};

