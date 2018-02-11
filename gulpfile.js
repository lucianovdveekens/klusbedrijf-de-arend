var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var del = require('del');
var pkg = require('./package.json');

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss')
  .pipe(sass())
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// Minify compiled CSS
gulp.task('minify-css', ['sass'], function() {
  return gulp.src('app/css/*.css')
  .pipe(cleanCSS({
    compatibility: 'ie8'
  }))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('dist/css'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// Minify custom JS
gulp.task('minify-js', function() {
  return gulp.src('tmp/js/*.js')
  .pipe(uglify())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
})

// Copy vendor files from /node_modules into /vendor
// NOTE: requires `npm install` before running!
gulp.task('vendors', function() {
  gulp.src([
    'node_modules/bootstrap/dist/**/*',
    '!**/npm.js',
    '!**/bootstrap-theme.*',
    '!**/*.map'
  ])
  .pipe(gulp.dest('app/vendor/bootstrap'))
  
  gulp.src([
    'node_modules/jquery/dist/jquery.js', 
    'node_modules/jquery/dist/jquery.min.js'
  ])
  .pipe(gulp.dest('app/vendor/jquery'))
  
  gulp.src(['node_modules/jquery.easing/*.js'])
  .pipe(gulp.dest('app/vendor/jquery-easing'))
  
  gulp.src(['node_modules/magnific-popup/dist/*'])
  .pipe(gulp.dest('app/vendor/magnific-popup'))
  
  gulp.src([
    'node_modules/font-awesome/**',
    '!node_modules/font-awesome/**/*.map',
    '!node_modules/font-awesome/.npmignore',
    '!node_modules/font-awesome/*.txt',
    '!node_modules/font-awesome/*.md',
    '!node_modules/font-awesome/*.json'
  ])
  .pipe(gulp.dest('app/vendor/font-awesome'))
  
  gulp.src([
    'bower_components/slick-carousel/slick/**',
    '!bower_components/slick-carousel/slick/slick.js',
    '!bower_components/slick-carousel/slick/*.scss', 
    '!bower_components/slick-carousel/slick/*.rb', 
  ])
  .pipe(gulp.dest('app/vendor/slick-carousel'))

  gulp.src([
    'bower_components/slick-lightbox/dist/slick-lightbox.min.js', 
    'bower_components/slick-lightbox/dist/slick-lightbox.css'
  ])
  .pipe(gulp.dest('app/vendor/slick-lightbox'))
})

// Default task
gulp.task('default', ['sass', 'minify-css', 'minify-js', 'vendors']);

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
})

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'sass', 'minify-css', 'minify-js'], function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/css/**/*.css', ['minify-css']);
  gulp.watch('app/js/**/*.js', ['minify-js']);
  gulp.watch('app/*.html', browserSync.reload);
  // is this needed? Doesn't minify-js already trigger a reload?
  gulp.watch('app/js/**/*.js', browserSync.reload); 
});
