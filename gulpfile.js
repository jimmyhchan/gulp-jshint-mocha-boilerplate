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
    template = gutil.template,
    log = gutil.log,
    mocha = require('gulp-mocha'),
    DIST = './dist',
    TMP = './tmp';
    es = require('event-stream');

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

var appFiles = 'src/**/*.js',
    testFiles = 'test/**/*.spec.js',
    banner = ['/*!',
              ' * <%= pkg.name %> - <%= pkg.description %>',
              ' * @version v<%= pkg.version %>',
              ' * @link <%= pkg.homepage %>',
              ' * @licence <%= pkg.license %>',
              ' */',
              ''].join('\n');

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
// gulp.task('packDev', function() {
  // return packer({minify:false});
// });
// gulp.task('packProd', function() {
  // return packer({minify:true});
// });

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
// gulp.task('distribute', function() {
  // return gulp.src('tmp/**/*.js')
         // .pipe(gulp.dest(DIST));
// });
gulp.task('test', ['build'], function() {
  return gulp.src(testFiles)
         .pipe(mocha());
});

gulp.task('build', ['lint', 'mkTmp'], buildAll);
gulp.task('patchBuild', ['lint', 'mkTmp', 'bumpPatch'], buildAll);
gulp.task('minorBuild', ['lint', 'mkTmp', 'bumpMinor'], buildAll);

function _release() {
  gulp.src('tmp/**/*.js')
         .pipe(gulp.dest(DIST));
  gutil.log(['now do the following:',
             '  * git add -A',
             '  * git commit -m "releasing version x.x.x"',
             '  * git tag...',
             '  * git push ... '].join('\n'));
}
gulp.task('releasePatch', ['patchBuild', 'mkDist'], _release);
gulp.task('releaseMinor', ['minorBuild', 'mkDist'], _release);
gulp.task('default', ['test']);
