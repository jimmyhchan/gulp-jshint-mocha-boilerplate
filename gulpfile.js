var pkg = require('./package.json'),
    version = pkg.version || '0.0.0',
    pkgName = pkg.name,
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    replace = require('gulp-replace'),
    del = require('del'),
    gutil = require('gulp-util'),
    template = gutil.template,
    mocha = require('gulp-mocha');


gulp.task('lint', function() {
  return gulp.src('src/*.js')
          .pipe(jshint('.jshintrc'))
          .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('clean', function() {
  del('dist/*');
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

function packer(config) {
  var minify = config.minify || false;
  return gulp.src(appFiles)
         .pipe(replace('@@version', version))
         .pipe(minify ? concat(pkgName + '-min.js') : concat(pkgName+'.js'))
         .pipe(minify ? uglify(): gutil.noop())
         .pipe(header(banner, {pkg:pkg}))
         .pipe(jshint('.jshintrc'))
         .pipe(jshint.reporter('jshint-stylish'))
         .pipe(gulp.dest('dist'));
}
gulp.task('packDev', function() {
  return packer({minify:false});
});
gulp.task('packProd', function() {
  return packer({minify:true});
});

gulp.task('test', function() {
  return gulp.src(testFiles)
         .pipe(mocha());
});

gulp.task('package', ['packDev', 'packProd']);
gulp.task('build', ['lint', 'clean', 'package']);
gulp.task('default', ['build', 'test']);
