var gulp = require('gulp'),
    watch = require('gulp-watch'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify');

var dgd7ModuleSrc = [
  './src/*.js',
  './src/includes/include.*.js'
];

// Task to build the dg_d7.min.js file.
gulp.task('minifyJS', function(){
  return gulp.src(dgd7ModuleSrc)
      .pipe(gp_concat('concat.js'))
      .pipe(gulp.dest(''))
      .pipe(gp_rename('dg_d7.min.js'))
      .pipe(gp_uglify())
      .pipe(gulp.dest(''));
});

gulp.task('default', function () {
  watch(dgd7ModuleSrc, function(event) { gulp.start('minifyJS') });
  gulp.start('minifyJS');
});
