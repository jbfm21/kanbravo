'use strict';

var exec = require('child_process').exec;

function runCommand(plugins, command, callback)
{
    exec(command, function (err, stdout, stderr)
    {
        plugins.gutil.log(plugins.gutil.colors.magenta('[runCommand]'), stdout);
        plugins.gutil.log(plugins.gutil.colors.magenta('[runCommand]'), stderr);
        if (err !== null)
        {
            plugins.gutil.log(plugins.gutil.colors.magenta('[runCommand]'), 'exec error: ' + err);
        }
        if (callback)
        {
            callback();
        }
    });
}

module.exports = function (gulp, plugins, options)
{
    return function (callback)
    {
        plugins.gutil.log(plugins.gutil.colors.magenta('[stop-mongodb task]'), 'Killing process');
        var command = `${options.mongoExecPath} admin --host 127.0.0.1 --port 8700 --eval "db.shutdownServer();"`;
        plugins.gutil.log(plugins.gutil.colors.magenta('[stop-mongodb task]'), command);
        runCommand(plugins, command, callback);
  };
};
