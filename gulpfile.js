// Requires: ///////////////////////////////////////////////////////////////////
var gulp         = require('gulp');
var del          = require('del');
var autoprefixer = require('gulp-autoprefixer');
var concat       = require("gulp-concat");
var clean        = require("gulp-clean");
var server       = require('gulp-express');
var gulpFilter   = require("gulp-filter");
var less         = require("gulp-less");
var jade         = require('gulp-jade');
var livereload   = require('gulp-livereload');
var rename       = require("gulp-rename");
var uglify       = require("gulp-uglify");
// var gutil        = require('gulp-util');
var sequence     = require('run-sequence');
////////////////////////////////////////////////////////////////////////////////
gulp.task('default', ['build']);

var paths = {
  build:   './.build/',
  views:   ['client/views/**/*.jade'],
  scripts: ['client/scripts/**/*.js'],
  styles:  [
    'client/styles/**/*.less',
    'client/styles/**/*.css'
  ],
  assets:  ['client/assets/**/*'],
  libs:    ['client/libs/**/*'],
  server:  ['server/**/*']
};
////////////////////////////////////////////////////////////////////////////////


gulp.task('build', function(cb) {
  sequence(
    'clean',
    ['libs', 'assets', 'scripts', 'styles', 'views'],
    cb
  );
}); 

gulp.task('server', ['build', 'livereload'], function() {
  // Running the development server
  server.run({
    file: 'app.js'
  });
 
  // Setting up watchers
  gulp.watch(paths.views,   ['views']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles,  ['styles']);
  gulp.watch(paths.assets,  ['assets']);
  // gulp.watch(paths.libs,    ['libs']);

  // Reload the server on every change to the server folder
  gulp.watch(paths.server,  function(stuff) {
    server.run(stuff);
    setTimeout(function() {
      server.notify(stuff);
      console.log(">> Notifying that the server was restarted");
    }, 1000);
  });

  // Setting up livereload
  // gulp.watch([paths.build + '**'], server.notify);
  gulp.watch(['./materials/' + '**'], server.notify);
});

gulp.task('livereload', function() {
  // var server = livereload();

  // Running the auto reload server
});

gulp.task('clean', function(cb) {
  del([
    paths.build + '**'
  ], {
    force: true
  }, cb);
});

gulp.task('assets', function() {
  return gulp.src(paths.assets)
  .pipe(gulp.dest(paths.build + '/assets/'));
});

gulp.task('libs', function() {
  return gulp.src(paths.libs)
  .pipe(gulp.dest(paths.build + '/libs/'));
});

gulp.task('views', function() {
  return gulp.src(paths.views)
  .pipe(jade({
    pretty: true
  }))
  .pipe(gulp.dest(paths.build + '/views/'));
});

gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
  .pipe(gulp.dest(paths.build + '/scripts/'));
});

gulp.task('styles', function() {
  var less_filter = gulpFilter(['*.less']);

  return gulp.src(paths.styles)

  .pipe(less_filter)
  .pipe(less())
  .pipe(less_filter.restore())

  .pipe(autoprefixer({
    browsers: ['last 2 versions']
  }))
  .pipe(gulp.dest(paths.build + '/styles/'));
});
