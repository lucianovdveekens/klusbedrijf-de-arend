var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var del = require('del');
var inject = require('gulp-inject');
var pkg = require('./package.json');

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss')
  .pipe(sass())
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

gulp.task('html:dist', function () {
  return gulp.src('app/*.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('vendor:dist', ['vendor'], function () {
  return gulp.src('app/vendor/**/*')
    .pipe(gulp.dest('dist/vendor'));
});

gulp.task('css:dist', ['sass'], function() {
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

gulp.task('js:dist', function() {
  return gulp.src('app/js/*.js')
  .pipe(uglify())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

gulp.task('images:dist', function () {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('mail:dist', function () {
  return gulp.src('app/mail/*.php')
    .pipe(gulp.dest('dist/mail'));
});

gulp.task('clean', function() {
  return del.sync('dist');
})

// Copy vendor files from /node_modules into /vendor
// NOTE: requires `npm install` before running!
gulp.task('vendor', function() {
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

gulp.task('inject', ['sass'], function () {
  return gulp.src('app/index.html')
  .pipe(inject(gulp.src('app/css/*.css'), { relative:true } ))
  .pipe(inject(gulp.src('app/js/*.js'), { relative:true } ))
  .pipe(gulp.dest('app'));
});

// Copy everything to dist
gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist', 'vendor:dist', 'images:dist', 'mail:dist']);

gulp.task('inject:dist', ['copy:dist'], function () {
  return gulp.src('dist/index.html')
  .pipe(inject(gulp.src('dist/css/*.css'), { relative:true } ))
  .pipe(inject(gulp.src('dist/js/*.js'), { relative:true } ))
  .pipe(gulp.dest('dist'));
});

// Build dist
gulp.task('build', ['inject:dist']);

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
})

// Default task
gulp.task('default', ['sass', 'vendor', 'inject']);

// Browser Sync for live reloads
gulp.task('dev', ['browserSync', 'default'], function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload); 
});
