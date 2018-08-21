module.exports = function (gulp, plugins, options) {
    return function () {
        if (options.flatten)
        {
            return gulp.src(options.src).pipe(plugins.flatten()).pipe(gulp.dest(options.dest));
        }
        return gulp.src(options.src).pipe(gulp.dest(options.dest));
  };
};
