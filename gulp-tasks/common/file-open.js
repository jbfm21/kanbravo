'use strict';

//options { src:'./logs/dev/coverage/main/index.html'}
module.exports = function (gulp, plugins, options) {
    return function () {
         let stream = gulp.src(options.src).pipe(plugins.open());
         return stream;
    };
};
