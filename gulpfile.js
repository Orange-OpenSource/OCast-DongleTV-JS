var gulp = require('gulp');
var mocha = require('gulp-mocha');
var $ = require('gulp-load-plugins')();


var plumberConf = {};

if (process.env.CI) {
    plumberConf.errorHandler = function(err) {
        throw err;
    };
}

gulp.task('default', function() {
    gulp.watch(['lib/**', 'test/**'], ['test']);
});

gulp.task('jshint', function () {
    return gulp.src(['./gulpfile.js', './lib/*.js', './test/www/js/orangecast/**/*.js'])
        .pipe($.jshint('.jshintrc'))
        .pipe($.plumber(plumberConf))
        .pipe($.jscs())
        .pipe($.jshint.reporter('jshint-stylish'));
});

var istanbul = require('gulp-istanbul');

gulp.task('pre-test', function () {
    return gulp.src(['lib/**/*.js'])
        // Covering files
        .pipe(istanbul())
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
    return gulp.src(['test/*.js'])
        .pipe(mocha())
        // Creating the reports after tests ran
        .pipe(istanbul.writeReports())
        // Enforce a coverage of at least 90%
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 75 } }));
});
