module.exports = function (gulp, plugins, options)
{
    return function ()
    {
        return plugins.browserify(
        {
            entries: [options.entry],
            transform: ['babelify'],
            debug: options.debug,
            cache: {},
            packageCache: {},
            fullPaths: true
        })
        .external(options.vendors)
        .bundle()
        .pipe(plugins.vinylSource(options.compiledJSFile))
        .pipe(plugins.vinylBuffer())
        .pipe(plugins.sourcemaps.init({loadMaps: true}))
        .pipe(plugins.if(process.env.NODE_ENV === 'production', plugins.uglify()))
        .pipe(plugins.sourcemaps.write('./maps'))
        .pipe(gulp.dest(options.dest));
  };
};
