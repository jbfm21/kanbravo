'use strict';

var spawn = require('cross-spawn').spawn;

module.exports = function (gulp, plugins, options)
{
    return function ()
    {
        options.nodemon.NODE_ENV = process.env.NODE_ENV;
        plugins.nodemon(options.nodemon)
        .on('readable', function()
        {
            var bunyan = spawn(options.bunyanExec, ['--output', 'short', '--color']);
            bunyan.stdout.pipe(process.stdout);
            bunyan.stderr.pipe(process.stderr);
            this.stdout.pipe(bunyan.stdin);
            this.stderr.pipe(bunyan.stdin);
        });
    };
};
