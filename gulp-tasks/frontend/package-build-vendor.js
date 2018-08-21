module.exports = function (gulp, plugins, options)
{
    return function ()
    {
        const b = plugins.browserify({transform: ['babelify'], debug: options.debug, cache: {}, packageCache: {}, fullPaths: true});

        // require all libs specified in vendors array
        options.vendors.forEach(lib =>{b.require(lib);});

        return b.bundle()
        .pipe(plugins.vinylSource(options.compiledJSFile))
        .pipe(plugins.vinylBuffer())
        .pipe(plugins.sourcemaps.init({loadMaps: true}))
        .pipe(plugins.if(process.env.NODE_ENV === 'production', plugins.uglify()))
        .pipe(plugins.sourcemaps.write('./maps'))
        .pipe(gulp.dest(options.dest));
  };
};
