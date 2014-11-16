var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var paths = {
  js : './js',
  pack : './pack',
  coffee: './coffee/*.coffee'
};

gulp.task('cozy', function() {
  // Minify and copy all JavaScript (except vendor coffee)
  return gulp.src(paths.coffee)
    .pipe(coffee())
    .pipe(gulp.dest(paths.js))
    .pipe(uglify())
    .pipe(gulp.dest(paths.pack));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.coffee, ['cozy']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['cozy', 'watch']);
