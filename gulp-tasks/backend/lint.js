module.exports = function (gulp, plugins) {
    return function (callback) {
        gulp.src(['./backend/**/*.js', '!node_modules/**'])
            .pipe(plugins.eslint())
            .pipe(plugins.eslint.format())
            .pipe(plugins.eslint.failAfterError());
        callback();
  };
};
