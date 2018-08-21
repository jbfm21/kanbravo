'use strict';

//options : {src: ['./backend/**/*.js', '!node_modules/**'] }
module.exports = function (gulp, plugins, options) {
    return function () {
        let stream = gulp.src(options.src)
            .pipe(plugins.eslint({quiet: true}))
            .pipe(plugins.eslint.format())
            .pipe(plugins.eslint.failAfterError());
        return stream;
  };
};
