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
var imageminSvgo = require('imagemin-svgo');
var imageResize = require('gulp-image-resize');
var rev = require('gulp-rev');
var htmlmin = require('gulp-htmlmin');
var newer = require('gulp-newer');
var concat = require('gulp-concat');
var critical = require('critical').stream;
var sourcemaps = require('gulp-sourcemaps');
var htmlclean = require('gulp-htmlclean');
var wiredep = require('wiredep').stream;
var useref = require('gulp-useref');
var revReplace = require('gulp-rev-replace');
var clean = require('gulp-clean');


var paths = {
  src: 'src/**/*',
  srcHTML: 'src/**/*.html',
  srcSCSS: 'src/**/*.scss',
  srcCSS: 'src/**/*.css',
  srcJS: 'src/**/*.js',
  srcIMG: 'src/images/*.{png,jpg,ico,svg}',
  srcPortfolio: 'src/images/portfolio/**/*.jpg',
  
  tmp: 'tmp',
  tmpIndex: 'tmp/index.html',
  tmpCSS: 'tmp/**/*.css',
  tmpJS: 'tmp/**/*.js',
  tmpIMG: 'tmp/images',  
  tmpPortfolio: 'tmp/images/portfolio',  
  
  dist: 'dist',
  distIndex: 'dist/index.html',
  distCSS: 'dist/**/*.css',
  distJS: 'dist/**/*.js',
  distIMG: 'dist/images',    
  distPortfolio: 'dist/images/portfolio'  
};

/*
=================
SOURCE FILE TASKS
=================
*/

gulp.task('css', function() {
  return gulp.src(paths.srcSCSS)
  .pipe(sass())
  .pipe(gulp.dest(paths.tmp))
});

gulp.task('js', function() {
  return gulp.src(paths.srcJS)
  .pipe(gulp.dest(paths.tmp))
});

gulp.task('html', function() {
  return gulp.src(paths.srcHTML)
  .pipe(gulp.dest(paths.tmp))
});

var compress = () => imagemin([ 
  imagemin.jpegtran({ progressive: true }), 
  imageminMozjpeg({ quality: 80 }),
  imageminPngquant({ quality: 80 })
])

gulp.task('portfolio', function () {
  return gulp.src(paths.srcPortfolio)
  .pipe(newer(paths.tmpPortfolio))
  .pipe(imageResize({ width: 1200, height: 675, upscale: false }))
  .pipe(compress())
  .pipe(gulp.dest(paths.tmpPortfolio));
});

gulp.task('thumbnail', function () {
  return gulp.src(paths.srcPortfolio)
  .pipe(newer(paths.tmpPortfolio))
  .pipe(imageResize({ width: 395, height: 285, crop: true, upscale: false }))
  .pipe(compress())
  .pipe(rename({ suffix: '-thumb' }))
  .pipe(gulp.dest(paths.tmpPortfolio));
});

gulp.task('compress-images', ['portfolio', 'thumbnail'], function() {
  return gulp.src(paths.srcIMG)
  .pipe(newer(paths.tmpIMG))
  .pipe(compress())
  .pipe(gulp.dest(paths.tmpIMG));
});

gulp.task('copy', ['html', 'css', 'js']);

/* 
====================
TEMPORARY FILE TASKS
====================
*/

gulp.task('inject', ['copy'], function () {
  return gulp.src(paths.tmpIndex)
  .pipe(wiredep())
  .pipe(inject(gulp.src(paths.tmpCSS), { relative: true } ))
  .pipe(inject(gulp.src(paths.tmpJS), { relative: true } ))
  .pipe(gulp.dest(paths.tmp))
  .pipe(browserSync.reload({ stream: true }));
});

gulp.task('serve', ['inject', 'compress-images'], function() {
  browserSync.init({
    server: {
      baseDir: 'tmp',
      routes:  {
        '/bower_components': 'bower_components'
      }
    }
  })
})

/* 
=======================
DISTRIBUTION FILE TASKS
=======================
*/

gulp.task('html:dist', function () {
  return gulp.src(paths.srcHTML)
  .pipe(htmlclean())
  .pipe(gulp.dest(paths.dist));
});

gulp.task('clean-css', () => gulp.src('dist/**/*.css').pipe(clean()))

gulp.task('css:dist', ['clean-css'], function () {
  return gulp.src(paths.srcSCSS)
  .pipe(sass())
  .pipe(concat('css/app.css'))
  .pipe(gulp.dest(paths.dist));
});

gulp.task('clean-js', () => gulp.src('dist/**/*.js').pipe(clean()))

gulp.task('js:dist', ['clean-js'], function () {
  return gulp.src(paths.srcJS)
  .pipe(concat('js/app.js'))
  .pipe(gulp.dest(paths.dist));
});

gulp.task('ajax-loader-gif', function() {
  return gulp.src('bower_components/slick-carousel/slick/ajax-loader.gif')
  .pipe(gulp.dest('dist/css'))
});

gulp.task('webfonts', function() {
  return gulp.src('bower_components/components-font-awesome/webfonts/*')
  .pipe(gulp.dest('dist/webfonts'))
});

gulp.task('slick-fonts', function() {
  return gulp.src('bower_components/slick-carousel/slick/fonts/*')
  .pipe(gulp.dest('dist/css/fonts'))
});

gulp.task('htaccess:dist', function() {
  return gulp.src('src/.htaccess*')
  .pipe(gulp.dest('dist'))
});

gulp.task('mail:dist', function() {
  return gulp.src('src/mail/*')
  .pipe(gulp.dest('dist/mail'))
});

gulp.task('vendor:dist', ['ajax-loader-gif', 'webfonts', 'slick-fonts']);

gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist', 'htaccess:dist', 'vendor:dist', 'mail:dist']);

gulp.task('inject:dist', ['copy:dist'], function () {
  return gulp.src(paths.distIndex)
  .pipe(wiredep())
  .pipe(inject(gulp.src(paths.distCSS), { relative:true } ))
  .pipe(inject(gulp.src(paths.distJS), { relative:true } ))
  .pipe(gulp.dest(paths.dist));
});

gulp.task('concat-assets', ['inject:dist'], function () {
  var jsFilter = filter("**/*.js", { restore: true });
  var cssFilter = filter("**/*.css", { restore: true });
  return gulp.src(paths.distIndex)
  .pipe(useref())
  .pipe(jsFilter)
  .pipe(uglify())
  .pipe(rev())
  .pipe(jsFilter.restore)
  .pipe(cssFilter)
  .pipe(cleanCSS())
  .pipe(rev())
  .pipe(cssFilter.restore)
  .pipe(revReplace())
  .pipe(gulp.dest(paths.dist));
});

gulp.task('portfolio:dist', function () {
  return gulp.src(paths.srcPortfolio)
  .pipe(newer(paths.distPortfolio))
  .pipe(imageResize({ width: 1200, height: 675, upscale: false }))
  .pipe(compress())
  .pipe(gulp.dest(paths.distPortfolio));
});

gulp.task('thumbnail:dist', function () {
  return gulp.src(paths.srcPortfolio)
  .pipe(newer(paths.distPortfolio))
  .pipe(imageResize({ width: 395, height: 285, crop: true, upscale: false }))
  .pipe(compress())
  .pipe(rename({ suffix: '-thumb' }))
  .pipe(gulp.dest(paths.distPortfolio));
});

gulp.task('compress-images:dist', ['portfolio:dist', 'thumbnail:dist'], function() {
  return gulp.src(paths.srcIMG)
  .pipe(newer(paths.distIMG))
  .pipe(compress())
  .pipe(gulp.dest(paths.distIMG));
});

gulp.task('critical-css', ['concat-assets'], function () {
  return gulp.src(paths.distIndex)
  .pipe(critical({
    inline: true,
    minify: true,
    base: 'dist',
    src: 'index.html',
    dest: 'index.html',
    dimensions: [{
      width: 320,
      height: 480
    },{
      width: 768,
      height: 1024
    },{
      width: 1280,
      height: 960
    }, {
      width: 1920,
      height: 1080
    }]
  }))
  .pipe(gulp.dest(paths.dist))
});

gulp.task('serve:dist', ['build'], function() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
})

/*
===========
BUILD TASKS
===========
*/

gulp.task('watch', ['serve'], function () {
  gulp.watch(paths.src, ['inject']);
});

gulp.task('default', ['watch']);

gulp.task('build', ['critical-css', 'compress-images:dist']);

gulp.task('clean', function() {
  del([paths.tmp, paths.dist]);
});
