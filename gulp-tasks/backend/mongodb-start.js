'use strict';

var spawn = require('cross-spawn').spawn;
var mongoProc = null;

module.exports = function (gulp, plugins, options)
{
    return function (callBackAfterStartMongo)
    {
        let command = options.mongodbExecPath;
        let parameters = ['-f', options.mongodbConfigFile, '--dbpath', options.databasePath];
        mongoProc = spawn(command, parameters);
        mongoProc.stdout.on('data', function(data)
        {
            //gutil.log(gutil.colors.magenta('[mongodb]'), data.toString());
            if (data.toString().indexOf('waiting for connections on port') > 0)
            {
                plugins.gutil.log(plugins.gutil.colors.magenta('[mongodb]'), data.toString());
                callBackAfterStartMongo();
            }
        });
        mongoProc.stderr.on('data', function(data)
        {
            plugins.gutil.log(plugins.gutil.colors.magenta('[mongodb]'), data.toString());
        });
  };
};
