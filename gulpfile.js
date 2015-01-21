var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    bump = require('gulp-bump'),
    header = require('gulp-header'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    del = require('del'),
    gutil = require('gulp-util'),
    mkdir = require('mkdirp'),
    mocha = require('gulp-mocha'),
    DIST = './dist',
    TMP = './tmp';

var appFiles = 'src/**/*.js',
    testFiles = 'test/**/*.spec.js',
    banner = ['/*!',
              ' * <%= pkg.name %> - <%= pkg.description %>',
              ' * @version v<%= pkg.version %>',
              ' * @link <%= pkg.homepage %>',
              ' * @license <%= pkg.license %>',
              ' */',
              ''].join('\n');

gulp.task('lint', function() {
  return gulp.src('src/*.js')
          .pipe(jshint('.jshintrc'))
          .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('clean', function(cb) {
  del(TMP, cb);
});

gulp.task('cleanDist', function(cb) {
  del(DIST, cb);
});

gulp.task('mkTmp', ['clean'], function(cb) {
  mkdir(TMP, cb);
});
gulp.task('mkDist', ['cleanDist'], function(cb) {
  mkdir(DIST, cb);
});
function packer(config) {
  var pkg = require('./package.json');
  return gulp.src(appFiles)
         .pipe(replace('@@version', pkg.version))
         .pipe(header(banner, {pkg:pkg}))
         .pipe(concat(pkg.name+'.js'))
         .pipe(jshint('.jshintrc'))
         .pipe(jshint.reporter('jshint-stylish'))
         .pipe(gulp.dest(TMP))
         .pipe(rename(pkg.name + '-min.js'))
         .pipe(uglify({preserveComments: 'some'}))
         .pipe(gulp.dest(TMP));
}

function buildAll() {
  return packer();
}

gulp.task('bumpPatch', function() {
  return gulp.src(['./*.json'])
  .pipe(bump({type:'patch'}))
  .pipe(gulp.dest('./'));
});
gulp.task('bumpMinor', function() {
  return gulp.src(['./*.json'])
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});
function _release() {
  gulp.src('tmp/**/*.js')
         .pipe(gulp.dest(DIST));
  gutil.log(['now do the following:',
             '  * git add -A',
             '  * git commit -m "releasing version x.x.x"',
             '  * git tag -a vx.x.x -m "tagging version x.x.x"...',
             '  * git push origin ',
             '  * git push origin --tags'].join('\n'));
}

gulp.task('test', ['build'], function() {
  return gulp.src(testFiles)
         .pipe(mocha());
});

gulp.task('build', ['lint', 'mkTmp'], buildAll);
gulp.task('patchBuild', ['lint', 'mkTmp', 'bumpPatch'], buildAll);
gulp.task('minorBuild', ['lint', 'mkTmp', 'bumpMinor'], buildAll);

gulp.task('releasePatch', ['patchBuild', 'mkDist'], _release);
gulp.task('releaseMinor', ['minorBuild', 'mkDist'], _release);
gulp.task('default', ['test']);
