'use strict';

var gulp = require('gulp');
var git = require('gulp-git');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var gulpif = require('gulp-if');
var del = require('del');

var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');

var gutil = require('gulp-util');


var taskManager = require('./gulp-tasks');
var setEnv = require('gulp-env');


var MONGODB_PATH_EXEC = 'D:\\kb\\node_modules\\mongodb-prebuilt\\dist\\3.2.0\\bin\\mongod';
var NODE_APP = 'backend/main/app.js';
var MONGODB_CONFIG = 'D:\\kb\\tmp\\mongodb2\\mongod.conf';
var MONGODB_PATH_DB = 'D:\\kb\\tmp\\mongodb2\\db';
var MONGO_PATH_EXEC = 'D:\\dsv\\MongoDB\\bin\\mongo';

var nodemonOpts = {
    script: NODE_APP,
    ext: 'js json',
    ignore: ['node_modules/', 'frontend/', 'etc/', 'logs/', 'mongodb/', 'typing/', 'outros/'],
    stdout: false,
    readable: false
};

/************************************************* */
/*Environment Tasks                                */
/************************************************* */
gulp.task('set-dev-env', function(callback)
{
    setEnv({vars: {DEBUG: 'qkanban-server', NODE_ENV: 'development'}});
    callback();
});

gulp.task('set-test-env', function(callback)
{
    setEnv({vars: {DEBUG: 'qkanban-server', NODE_ENV: 'test'}});
    callback();
});
gulp.task('set-prd-env', function(callback)
{
    setEnv({vars: {DEBUG: 'qkanban-server', NODE_ENV: 'production'}});
    callback();
});


/************************************************* */
/*Frontend                                         */
/************************************************* */

//build datestamp for cache busting
var getStamp = function()
{
  var myDate = new Date();
  var myYear = myDate.getFullYear().toString();
  var myMonth = ('0' + (myDate.getMonth() + 1)).slice(-2);
  var myDay = ('0' + myDate.getDate()).slice(-2);
  var mySeconds = myDate.getSeconds().toString();
  var myFullDate = myYear + myMonth + myDay + mySeconds;
  return myFullDate;
};

var frontendPath = {
  src: {
      html: './frontend/app/index.html',
      images: './frontend/images/**/*.*',
      attachments: './frontend/attachments/**/*.*',
      css: './frontend/app/css/*.css',
      sass: './frontend/sass/*.scss',
      reactEntryPoint: './frontend/app/App.jsx',
      vendors: ['airflux',
        'autosuggest-highlight',
        'classnames',
        'debug',
        'draft-js',
        'draft-js-utils',
        'draftjs-to-html',
        'draftjs-to-markdown',
        'html-to-draftjs',
        'draft-js-import-markdown',
        'enumify',
        'harmony-reflect',
        'i18n',
        'immutable',
        'jwt-decode',
        'jwt-simple',
        'lodash',
        'marked',
        'moment',
        'newforms',
        'pure-render-decorator',
        'react',
        'react-addons-css-transition-group',
        'react-addons-update',
        'react-autosuggest',
        'react-color',
        'react-custom-scroll',
        'react-dnd',
        'react-dnd-html5-backend',
        'react-draft-wysiwyg',
        'react-dom',
        'react-dropzone',
        'react-intl',
        'react-loader',
        'react-router',
        'react-rte',
        'react-portal-tooltip',
        'react-selectize',
        'react-semantify',
        'react-textarea-autosize',
        'react-themeable',
        'react-toastr',
        'socket.io-client',
        'react-big-calendar',
        'object-assign',
        'toastr',
        'vis',
        'd3']
  },
  dest: {
      root: './tmp/deploy/frontend',
      index: './tmp/deploy/frontend/index.html',
      vendor: '/vendor',
      fonts: '/fonts',
      css: '/css',
      attachments: '/attachments',
      images: '/images',
      js: '/js',
      compiledAppJSFile: 'appCompiled.js',
      compiledVendorJSFile: 'vendorCompiled.js'
  }
};

gulp.task('frontend-js-quality', taskManager.getCommonTask('js-quality', {src: ['./frontend/app/**/*.js', './frontend/app/**/*.jsx', '!./frontend/app/locales/*.*']}));

gulp.task('frontend-package-html', taskManager.getCommonTask('file-copy', {src: frontendPath.src.html, dest: frontendPath.dest.root}));
gulp.task('frontend-package-images', taskManager.getCommonTask('file-copy', {src: frontendPath.src.images, dest: frontendPath.dest.root + frontendPath.dest.images}));
gulp.task('frontend-package-attachments', taskManager.getCommonTask('file-copy', {src: frontendPath.src.attachments, dest: frontendPath.dest.root + frontendPath.dest.attachments}));
gulp.task('frontend-package-sass', taskManager.getFrontendTask('package-sass', {src: frontendPath.src.sass, dest: frontendPath.dest.root + frontendPath.dest.css}));
gulp.task('frontend-package-react', taskManager.getFrontendTask('package-react', {entry: frontendPath.src.reactEntryPoint, debug: true, vendors: frontendPath.src.vendors, compiledJSFile: frontendPath.dest.compiledAppJSFile, dest: frontendPath.dest.root + frontendPath.dest.js}));

gulp.task('frontend-package-build-vendor', taskManager.getFrontendTask('package-build-vendor', {entry: frontendPath.src.reactEntryPoint, debug: true, vendors: frontendPath.src.vendors, compiledJSFile: frontendPath.dest.compiledVendorJSFile, dest: frontendPath.dest.root + frontendPath.dest.js}));
gulp.task('frontend-package-vendors-jquery', taskManager.getCommonTask('file-copy', {src: ['./node_modules/jquery/**/dist/*.js'], flatten: true, dest: frontendPath.dest.root + frontendPath.dest.vendor + '/jquery'}));
gulp.task('frontend-package-vendors-semantic-ui', taskManager.getCommonTask('file-copy', {src: ['./frontend/vendor/semantic-ui/dist2_2/**/*.*'], dest: frontendPath.dest.root + frontendPath.dest.vendor + '/semantic-ui'}));
gulp.task('frontend-package-vendors-react-selectize', taskManager.getCommonTask('file-copy', {src: ['./frontend/vendor/react-selectize/**/*.*'], dest: frontendPath.dest.root + frontendPath.dest.vendor + '/react-selectize'}));
gulp.task('frontend-package-vendors-toastr', taskManager.getCommonTask('file-copy', {src: ['./node_modules/toastr/**/build/*.css', './node_modules/toastr/**/build/*.js', './node_modules/toastr/**/build/*.map'], flatten: true, dest: frontendPath.dest.root + frontendPath.dest.vendor + '/toastr'}));
gulp.task('frontend-package-vendors-animatecss', taskManager.getCommonTask('file-copy', {src: ['./node_modules/animate.css/*.css', './node_modules/animate.css/*.js', '!./node_modules/animate.css/gulpfile.js'], flatten: true, dest: frontendPath.dest.root + frontendPath.dest.vendor + '/animatecss'}));
gulp.task('frontend-package-vendors-alloyeditor', taskManager.getCommonTask('file-copy', {src: ['./node_modules/alloyeditor/dist/alloy-editor/**/*.css', './node_modules/alloyeditor/dist/alloy-editor/**/*.js'], dest: frontendPath.dest.root + frontendPath.dest.vendor + '/alloy-editor'}));
gulp.task('frontend-package-vendors-vis', taskManager.getCommonTask('file-copy', {src: ['./node_modules/vis/dist/*.css'], dest: frontendPath.dest.root + frontendPath.dest.vendor + '/vis'}));
gulp.task('frontend-package-vendors-react-big-calendar', taskManager.getCommonTask('file-copy', {src: ['./node_modules/react-big-calendar/lib/css/*.css'], dest: frontendPath.dest.root + frontendPath.dest.vendor + '/react-big-calendar'}));

gulp.task('frontend-package-vendors-react-draft-wysiwyg', taskManager.getCommonTask('file-copy', {src: ['./node_modules/react-draft-wysiwyg/dist/*.css'], dest: frontendPath.dest.root + frontendPath.dest.vendor + '/react-draft-wysiwyg'}));



gulp.task('frontend-package-vendors-font-awesome',
    taskManager.getCommonTask('file-copy', {src: ['./node_modules/font-awesome/**/css/*.*', './node_modules/font-awesome/**/fonts/*.*'], flatten: false, dest: frontendPath.dest.root + frontendPath.dest.vendor + '/font-awesome'})
);

gulp.task('frontend-package-vendor-cachebust', function()
{
  return gulp.src(frontendPath.dest.root + '/*.html')
    .pipe(replace(/vendorCompiled.js[\?0-9]*/g, 'vendorCompiled.js?' + getStamp()))
    .pipe(gulp.dest(frontendPath.dest.root));
});

gulp.task('frontend-package-vendors', gulp.series(
    'frontend-package-build-vendor',
    'frontend-package-vendors-jquery',
    'frontend-package-vendors-toastr',
    'frontend-package-vendors-animatecss',
    'frontend-package-vendors-semantic-ui',
    'frontend-package-vendors-alloyeditor',
    'frontend-package-vendors-react-selectize',
    'frontend-package-vendors-font-awesome',
    'frontend-package-vendors-react-draft-wysiwyg',
    'frontend-package-vendors-vis',
    'frontend-package-vendors-react-big-calendar',
    'frontend-package-vendor-cachebust'));

gulp.task('frontend-package-app-cachebust', function()
{
  return gulp.src(frontendPath.dest.root + '/*.html')
    .pipe(replace(/appCompiled.js[\?0-9]*/g, 'appCompiled.js?' + getStamp()))
    .pipe(gulp.dest(frontendPath.dest.root));
});

gulp.task('frontend-package', gulp.series('frontend-package-html', 'frontend-package-images', 'frontend-package-attachments', 'frontend-package-sass', 'frontend-package-react', 'frontend-package-vendors', 'frontend-package-app-cachebust'));

gulp.task('frontend-watch-html', function() { return gulp.watch(frontendPath.src.html, gulp.parallel('frontend-package-html'));});
gulp.task('frontend-watch-sass', function() { return gulp.watch(frontendPath.src.sass, gulp.parallel('frontend-package-sass'));});
gulp.task('frontend-watch-react', function()
{

    let b = browserify({entries: [frontendPath.src.reactEntryPoint], transform: ['babelify'], debug: true, cache: {}, packageCache: {}, fullPaths: true});
    b.plugin(watchify);
    let bundle = function()
    {
        b.external(frontendPath.src.vendors)
        .bundle()
        .pipe(source(frontendPath.dest.compiledAppJSFile))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))

        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(frontendPath.dest.root + frontendPath.dest.js));

        gulp.src(frontendPath.dest.root + '/*.html')
        .pipe(replace(/appCompiled.js[\?0-9]*/g, 'appCompiled.js?' + getStamp()))
        .pipe(gulp.dest(frontendPath.dest.root));

        gutil.log(gutil.colors.magenta('[frontend-watch-react]'), 'File updated: ' + frontendPath.dest.root + frontendPath.dest.js);

    };
    b.on('update', bundle);
    bundle();
});

gulp.task('frontend-watch', gulp.parallel('frontend-watch-html', 'frontend-watch-sass', 'frontend-watch-react'));

gulp.task('frontend-start-server', taskManager.getFrontendTask('server-start.js', {root: frontendPath.dest.root, fallback: frontendPath.dest.root + '/index.html'}));

/************************************************* */
/*Backend Tasks                                    */
/************************************************* */
var backendPath = {
  src: {
      app: './backend/main'
  }
};
gulp.task('backend-test-run', function(callback)
{
    let task = taskManager.getBackEndTask('test-run', {mongoExecPath: MONGO_PATH_EXEC, src: ['backend/main/**/*.js'], testSrc: ['backend/test/**/*.js'], coverageReport: {dir: './tmp/logs/dev/coverage', reporters: ['html', 'text-summary', 'text']}});
    task(callback);

});
gulp.task('backend-test-showreport', taskManager.getCommonTask('file-open', {src: './tmp/logs/dev/coverage/index.html'}));
gulp.task('backend-js-quality', taskManager.getCommonTask('js-quality', {src: ['./backend/main/**/*.js', '!node_modules/**']}));
gulp.task('kill-gulp', function(callback)
{
    let taskToExecute = taskManager.getCommonTask('kill-gulp');
    taskToExecute(callback);
});
gulp.task('backend-stop-mongodb', function (callback)
{
    let taskToExecute = taskManager.getBackEndTask('mongodb-stop', {mongoExecPath: MONGO_PATH_EXEC});
    taskToExecute(callback);
});
gulp.task('backend-start-mongodb', function (callback)
{
    let taskToExecute = taskManager.getBackEndTask('mongodb-start', {mongodbExecPath: MONGODB_PATH_EXEC, databasePath: MONGODB_PATH_DB, mongodbConfigFile: MONGODB_CONFIG});
    taskToExecute(callback);
});
gulp.task('backend-start-server', taskManager.getBackEndTask('server-start', {nodemon: nodemonOpts, bunyanExec: 'd:/kb/node_modules/bunyan/bin/bunyan'}));


/************************************************* */
/*DOCKER                                           */
/************************************************* */
var dockerPath = {
    dockerFrontend: 'D:/kb/docker/frontend/app'
};

gulp.task('docker-frontend-clean', function ()
{
    return del([dockerPath.dockerFrontend + '/**/*'], {force: true});
});
gulp.task('docker-frontend-copy', function ()
{
    return gulp.src(
        [frontendPath.dest.root + '/**/*',
         '!' + frontendPath.dest.root + frontendPath.dest.attachments + '/**/*',
         '!' + frontendPath.dest.root + frontendPath.dest.images + '/**/*'
         ])
         .pipe(gulp.dest(dockerPath.dockerFrontend));
});
gulp.task('docker-frontend-copy-images', function ()
{
    return gulp.src(
        [frontendPath.dest.root + frontendPath.dest.images + '/*.*'
         ]).pipe(gulp.dest(dockerPath.dockerFrontend + frontendPath.dest.images));
});
gulp.task('docker-deploy', gulp.series('docker-frontend-clean', 'docker-frontend-copy', 'docker-frontend-copy-images'));
/************************************************* */
/* Running Tasks                                   */
/************************************************* */

gulp.task('package-server', gulp.series('backend-js-quality'));
gulp.task('package-frontend', gulp.series('frontend-js-quality', 'frontend-package'));
gulp.task('package', gulp.series('package-server', 'package-frontend'));

gulp.task('run-dev-server', gulp.series('set-dev-env','backend-start-mongodb', 'backend-start-server'));
gulp.task('run-dev-frontend', gulp.parallel('frontend-watch', 'frontend-start-server'));
gulp.task('run-dev', gulp.series('set-dev-env', 'package', gulp.parallel('run-dev-server', 'run-dev-frontend')));
gulp.task('run-prd', gulp.series('set-prd-env', 'package', 'docker-deploy', gulp.parallel('run-dev-server', 'run-dev-frontend')));

gulp.task('test', gulp.series('set-test-env', 'backend-js-quality', 'backend-stop-mongodb', 'backend-start-mongodb', 'backend-test-run', 'backend-stop-mongodb'));
gulp.task('test-result', gulp.series('test', 'backend-test-showreport'));

gulp.task('pkg-dev', gulp.series('set-dev-env', 'package'));
gulp.task('pkg-prd', gulp.series('set-prd-env', 'package'));

gulp.task('rds', gulp.series('run-dev-server'));
gulp.task('rdv', gulp.series('run-dev-frontend'));
gulp.task('rdq', gulp.series('frontend-js-quality'));

gulp.task('od', gulp.series('openshift-deploy'));

gulp.task('default', gulp.series('run-dev'));

gulp.task('default', gulp.series('run-dev'));


