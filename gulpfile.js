var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    bump = require('gulp-bump'),
    header = require('gulp-header'),
    replace = require('gulp-replace'),
    del = require('del'),
    gutil = require('gulp-util'),
    mkdir = require('mkdirp'),
    mocha = require('gulp-mocha'),
    es = require('event-stream'),
    DIST = './dist',
    TMP = './tmp';

var appFiles = 'src/**/*.js',
    testFiles = 'test/**/*.spec.js',
    banner = ['/*!',
              ' * <%= pkg.name %> - <%= pkg.description %>',
              ' * @version v<%= pkg.version %>',
              ' * @link <%= pkg.homepage %>',
              ' * @licence <%= pkg.license %>',
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
  var minify = config.minify || false,
      pkg = require('./package.json');
  return gulp.src(appFiles)
         .pipe(replace('@@version', pkg.version))
         .pipe(minify ? concat(pkg.name + '-min.js') : concat(pkg.name+'.js'))
         .pipe(minify ? uglify(): gutil.noop())
         .pipe(header(banner, {pkg:pkg}))
         .pipe(jshint('.jshintrc'))
         .pipe(jshint.reporter('jshint-stylish'))
         .pipe(gulp.dest(TMP));
}

function buildAll() {
  return es.concat(
    packer({minify: false}),
    packer({minify: true})
  );
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
