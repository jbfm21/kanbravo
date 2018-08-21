'use strict';

module.exports = function (gulp, plugins, options)
{
    return function ()
    {
         let stream = gulp.src(options.src)
            .pipe(plugins.istanbul({includeUntested: true}))
            .pipe(plugins.istanbul.hookRequire())
            .on('error', plugins.gutil.log);
        return stream;
    };
};
