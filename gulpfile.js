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
var pkg = require('./package.json');
var rev = require('gulp-rev');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var htmlmin = require('gulp-htmlmin');
var newer = require('gulp-newer');
var concat = require('gulp-concat');
var filelog = require('gulp-filelog');


gulp.task('css:clean', function () {
  return gulp.src('app/css', { read: false })
  .pipe(clean());
})

gulp.task('css:sass', ['css:clean'], function() {
  return gulp.src('app/scss/**/*.scss')
  .pipe(sass())
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.reload({ stream: true }))
});

gulp.task('html:dist', function () {
  return gulp.src('app/*.html')
  .pipe(gulp.dest('dist'));
});

gulp.task('htaccess:dist', function () {
  return gulp.src('app/.htaccess')
  .pipe(gulp.dest('dist'));
});

gulp.task('css:clean:dist', function () {
  return gulp.src('dist/css', { read: false })
  .pipe(clean());
})

gulp.task('css:dist', ['css:clean:dist', 'css:sass', 'vendor:concat'], function() {
  return gulp.src('app/css/*.css')
  .pipe(cleanCSS({ compatibility: 'ie8' }))
  .pipe(rename({ suffix: '.min' }))
  .pipe(rev())
  .pipe(gulp.dest('dist/css'))
  .pipe(browserSync.reload({ stream: true }))
});

gulp.task('js:clean', function () {
  return gulp.src('dist/js', { read: false })
  .pipe(clean());
})

gulp.task('js:dist', ['js:clean'], function() {
  return gulp.src('app/js/*.js')
  .pipe(uglify())
  .pipe(rename({ suffix: '.min' }))
  .pipe(rev())
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.reload({ stream: true }))
});

gulp.task('img:portfolio', function () {
  return gulp.src('app/images/portfolio/**/*.jpg')
  .pipe(newer('dist/images/portfolio'))
  .pipe(imageResize({ width: 1200, height: 675, upscale: false }))
  .pipe(imagemin([ imagemin.jpegtran({ progressive: true }), imageminMozjpeg({ quality: 80 }) ]))
  .pipe(gulp.dest('dist/images/portfolio'));
});

gulp.task('img:thumbnail', function () {
  return gulp.src('app/images/portfolio/**/*.jpg')
  .pipe(newer('dist/images/portfolio'))
  .pipe(imageResize({ width: 395, height: 285, crop: true, upscale: false }))
  .pipe(imagemin([ imagemin.jpegtran({ progressive: true }), imageminMozjpeg({ quality: 80 }) ]))
  .pipe(rename({ suffix: '-thumb' }))
  .pipe(gulp.dest('dist/images/portfolio'));
});

gulp.task('img:other', function () {
  return gulp.src('app/images/*.{gif,png,jpg}')
  .pipe(newer('dist/images'))
  .pipe(imageResize({ width: 300, upscale: false }))
  .pipe(imagemin([ imagemin.jpegtran({ progressive: true }), imageminMozjpeg({ quality: 80 }), imageminPngquant({ quality: 80 }) ]))
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
});

gulp.task('vendor:bootstrap', function() {
  return gulp.src([
    'node_modules/bootstrap/dist/**/*',
    '!**/npm.js',
    '!**/bootstrap-theme.*',
    '!**/*.map',
    '!**/*.min.css'
  ])
  .pipe(gulp.dest('app/vendor/bootstrap'))
});

gulp.task('vendor:jquery', function() {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js', 
    'node_modules/jquery/dist/jquery.min.js'
  ])
  .pipe(gulp.dest('app/vendor/jquery'))
});

gulp.task('vendor:jquery.easing', function() {
  return gulp.src(['node_modules/jquery.easing/*.js'])
  .pipe(gulp.dest('app/vendor/jquery-easing'))
});

gulp.task('vendor:magnific-popup', function() {
  return gulp.src([
    'node_modules/magnific-popup/dist/jquery.magnific-popup.min.js',
    'node_modules/magnific-popup/dist/magnific-popup.css'
  ])
  .pipe(gulp.dest('app/vendor/magnific-popup'))
});

gulp.task('vendor:font-awesome', function() {
  return gulp.src([
    'node_modules/font-awesome/**',
    '!node_modules/font-awesome/**/*.map',
    '!node_modules/font-awesome/.npmignore',
    '!node_modules/font-awesome/*.txt',
    '!node_modules/font-awesome/*.md',
    '!node_modules/font-awesome/*.json',
    '!**/*.min.css'
  ])
  .pipe(gulp.dest('app/vendor/font-awesome'))
});

gulp.task('vendor:slick-carousel', function() {
  return gulp.src([
    'bower_components/slick-carousel/slick/**',
    '!bower_components/slick-carousel/slick/slick.js',
    '!bower_components/slick-carousel/slick/*.scss', 
    '!bower_components/slick-carousel/slick/*.rb', 
  ])
  .pipe(gulp.dest('app/vendor/slick-carousel'))
});

gulp.task('vendor:slick-lightbox', function() {
  return gulp.src([
    'bower_components/slick-lightbox/dist/slick-lightbox.min.js', 
    'bower_components/slick-lightbox/dist/slick-lightbox.css'
  ])
  .pipe(gulp.dest('app/vendor/slick-lightbox'))
});

gulp.task('vendor:copy', [
  'vendor:bootstrap', 
  'vendor:jquery', 
  'vendor:jquery.easing', 
  'vendor:magnific-popup',
  'vendor:font-awesome',
  'vendor:slick-carousel',
  'vendor:slick-lightbox',
])

gulp.task('vendor:concat', ['vendor:copy'], function() {
  return gulp.src('app/vendor/**/*.css')
  .pipe(concat('_vendor.css'))
  .pipe(gulp.dest('app/css'))
})

gulp.task('vendor:dist', function () {
  return gulp.src('app/vendor/**/*')
  .pipe(gulp.dest('dist/vendor'));
});

gulp.task('font:slick-carousel', function() {
  return gulp.src([
    'app/vendor/slick-carousel/fonts/slick.ttf',
    'app/vendor/slick-carousel/fonts/slick.woff'
  ])
  .pipe(gulp.dest('dist/css/fonts'))
});

gulp.task('font:ajax-loader-gif', function() {
  return gulp.src('app/vendor/slick-carousel/ajax-loader.gif')
  .pipe(gulp.dest('dist/css'))
});

gulp.task('font:font-awesome', function() {
  return gulp.src('app/vendor/font-awesome/fonts/*')
  .pipe(gulp.dest('dist/fonts'))
});

gulp.task('font:dist', ['font:slick-carousel', 'font:ajax-loader-gif', 'font:font-awesome']);

gulp.task('inject', ['css:sass'], function () {
  return gulp.src('app/index.html')
  .pipe(inject(gulp.src('app/css/*.css'), { relative:true } ))
  .pipe(inject(gulp.src('app/js/*.js'), { relative:true } ))
  .pipe(gulp.dest('app'));
});

gulp.task('img:dist', ['img:portfolio', 'img:thumbnail' , 'img:other']);

// Copy everything to dist
gulp.task('copy:dist', [
  'html:dist', 
  'css:dist', 
  'js:dist', 
  'vendor:dist',
  'htaccess:dist', 
  'favicon:dist', 
  'img:dist', 
  'mail:dist'
]);

gulp.task('inject:dist', function () {
  return gulp.src('dist/index.html')
  .pipe(inject(gulp.src('dist/css/*.css'), { relative:true } ))
  .pipe(inject(gulp.src('dist/js/*.js'), { relative:true } ))
  .pipe(gulp.dest('dist'));
});

gulp.task('html:minify', ['inject:dist'], function () {
  return gulp.src('dist/*.html')
  .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))  
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// Build dist
gulp.task('build', function (callback) {
  runSequence('copy:dist', 'font:dist', 'html:minify', callback)
})


// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
  })
})

// Browser Sync for live reloads
gulp.task('dev', ['browserSync', 'build'], function() {
  gulp.watch('app/scss/**/*.scss', ['html:minify']);
  gulp.watch('app/images/**/*', ['img:dist']);
  gulp.watch('app/*.html', ['html:minify']);
  gulp.watch('app/js/**/*.js', ['html:minify']); 
});