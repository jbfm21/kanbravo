//options : {src: ['./backend/**/*.js', '!node_modules/**'] }
module.exports = function (gulp, plugins, options, callback) {
    return function () {
        gulp.src(options.src)
            .pipe(plugins.eslint())
            .pipe(plugins.eslint.format())
            .pipe(plugins.eslint.failAfterError());
        callback();
  };
};
