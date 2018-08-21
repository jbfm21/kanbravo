'use strict';

var process = require('process');

module.exports = function ()
{
    return function (callback) {
        process.exit(0);
        callback();
    };
};
