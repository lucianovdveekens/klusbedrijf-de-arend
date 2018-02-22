var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var del = require('del');
var inject = require('gulp-inject');
var imagemin = require('gulp-imagemin');
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminPngquant = require('imagemin-pngquant');
var imageResize = require('gulp-image-resize');
var newer = require('gulp-newer');
var pkg = require('./package.json');
var rev = require('gulp-rev');
var clean = require('gulp-clean');


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

gulp.task('htaccess:dist', function () {
  return gulp.src('app/.htaccess')
  .pipe(gulp.dest('dist'));
});

gulp.task('clean-css', function () {
  return gulp.src('dist/css/*.min.css')
  .pipe(clean()) 
});

gulp.task('css:dist', ['clean-css', 'sass'], function() {
  return gulp.src('app/css/*.css')
  .pipe(cleanCSS({
    compatibility: 'ie8'
  }))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(rev())
  .pipe(gulp.dest('dist/css'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

gulp.task('clean-js', function () {
  return gulp.src('dist/js/*.min.js')
  .pipe(clean()) 
});

gulp.task('js:dist', ['clean-js'], function() {
  return gulp.src('app/js/*.js')
  .pipe(uglify())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(rev())
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

gulp.task('portfolio-images', function () {
  return gulp.src('app/images/portfolio/**/*.jpg')
  .pipe(newer('dist/images/portfolio'))
  .pipe(imageResize({ 
    width: 1200,
    height: 675,
    upscale: false,
  }))
  .pipe(imagemin([
    imagemin.jpegtran({
      progressive: true
    }),
    imageminMozjpeg({
      quality: 80
    }),
  ]))
  .pipe(gulp.dest('dist/images/portfolio'));
});

gulp.task('other-images', function () {
  return gulp.src('app/images/*.{gif,png,jpg}')
  .pipe(newer('dist/images'))
  .pipe(imageResize({ 
    width: 300,
    upscale: false
  }))
  .pipe(imagemin([
    imagemin.jpegtran({
      progressive: true
    }),
    imageminMozjpeg({
      quality: 80
    }),
    imageminPngquant({
      quality: 80
    }),    
  ]))
  .pipe(gulp.dest('dist/images'));
});

gulp.task('favicon:dist', function () {
  return gulp.src('app/images/favicon.ico')
  .pipe(gulp.dest('dist/images'));
});

gulp.task('mail:dist', function () {
  return gulp.src('app/mail/*.php')
  .pipe(gulp.dest('dist/mail'));
});

gulp.task('clean', function() {
  return del.sync('dist');
})

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

gulp.task('vendor:dist', ['vendor'], function () {
  return gulp.src('app/vendor/**/*')
  .pipe(gulp.dest('dist/vendor'));
});

gulp.task('inject', ['sass'], function () {
  return gulp.src('app/index.html')
  .pipe(inject(gulp.src('app/css/*.css'), { relative:true } ))
  .pipe(inject(gulp.src('app/js/*.js'), { relative:true } ))
  .pipe(gulp.dest('app'));
});

gulp.task('images:dist', ['portfolio-images', 'other-images']);

// Copy everything to dist
gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist', 'htaccess:dist', 'favicon:dist', 'vendor:dist', 'images:dist', 'mail:dist']);

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