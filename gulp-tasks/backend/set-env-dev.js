module.exports = function (gulp, plugins) {
    return function (callback) {
         gulp.src(['backend/main/**/*.js'])
            .pipe(plugins.istanbul({includeUntested: true}))
            .pipe(plugins.istanbul.hookRequire());
        callback();
    };
};
