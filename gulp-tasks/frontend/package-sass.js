module.exports = function (gulp, plugins, options)
{
    return function ()
    {
        return gulp.src(options.src)
            .pipe(plugins.plumber())
            .pipe(plugins.sass())
            .pipe(gulp.dest(options.dest));
  };
};
