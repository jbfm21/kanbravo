'use strict';
var isparta = require('isparta');
module.exports = function (gulp, plugins, options)
{
    return function (callback)
    {
        gulp.src(options.src)
        .pipe(plugins.istanbul({includeUntested: true, instrumenter: isparta.Instrumenter}))
        .pipe(plugins.istanbul.hookRequire())
        .on('finish', function()
        {
            gulp.src(options.testSrc)
            .pipe(plugins.mocha({reporter: 'spec'}))
            .pipe(plugins.istanbul.writeReports({dir: options.coverageReport.dir, reporters: options.coverageReport.reporters}))
            .pipe(plugins.istanbul.enforceThresholds({thresholds: {global: 90}}))
            .on('finish', () => callback())
            .on('error', plugins.gutil.log);
        })
        .on('error', plugins.gutil.log);
    };
};
