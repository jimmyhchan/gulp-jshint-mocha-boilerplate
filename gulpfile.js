var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    gutil = require('gulp-util'),
    mocha = require('gulp-mocha');


gulp.task('lint', function() {
  return gulp.src('lib/*.js')
          .pipe(jshint('.jshintrc'))
          .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('clean', function() {
  del('dist');
});

gulp.task('package', function() {
  // to do pack an unminified version as well
  //       pack license as well
  //       add version numbers into the files
  return gulp.src('lib/*.js')
         .pipe(concat('jspwn-min.js'))
         .pipe(uglify())
         .pipe(jshint('.jshintrc'))
         .pipe(jshint.reporter('jshint-stylish'))
         .pipe(gulp.dest('dist'));
});

gulp.task('test', function() {
  return gulp.src('test/**/*.spec.js')
         .pipe(mocha());
});

gulp.task('build', ['lint', 'clean', 'package']);
gulp.task('default', ['build', 'test']);
