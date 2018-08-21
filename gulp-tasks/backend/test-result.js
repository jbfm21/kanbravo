//options { src:'./logs/dev/coverage/main/index.html'}
module.exports = function (gulp, plugins, options, callback) {
    return function () {
         gulp.src(options.src).pipe(plugins.open());
         callback();
    };
};
