var addsrc = require('gulp-add-src');
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var less = require('gulp-less');
var nghtml2js = require('gulp-ng-html2js');
var replace = require('gulp-replace');
var rev = require('gulp-rev');
var revreplace = require('gulp-rev-replace');
var sourcemaps = require('gulp-sourcemaps');
var useref = require('gulp-useref');

gulp.task('compile-templates', ['compile-css'], function() {
    return gulp.src('src/app/**/*.tpl.html')
      .pipe(nghtml2js(
      {
        moduleName: 'templates-app',
        declareModule: false // already
      }))
      //.pipe(debug())
      .pipe(concat('templates.js'))
      .pipe(gulp.dest('dist/'));
  });

gulp.task('compile-css', function() {

  // everything is imported into main.less
  return gulp.src('src/less/app.less')

.pipe(debug())
    .pipe(sourcemaps.init())
    .pipe(less({
      compress: true
    }))
    .on('error', gutil.log) // don't crash on errors when we're watching files; but I don't think this actually works
    .pipe(sourcemaps.write({includeContent:false, sourceRoot:'.'}))
    .pipe(gulp.dest('src/app/'));
});

gulp.task('compile-html', ['compile-templates'], function()
{
  // TODO - add IIFE wrapping
  var assets = useref.assets();

  return gulp.src('src/app/index.html')

    // switch to minified version of angular
    .pipe(replace('angular.js', 'angular.min.js'))

    // returns a stream with our concatendated asset files from index.html; usually app.css and app.js
    .pipe(assets)

    .pipe(debug())

    // add the templates we compiled in compile-templates task
    .pipe(addsrc.append('dist/templates.js'))

    // concat all of our js files into a single file called app.js
    .pipe(gulpif('*.js', concat('app.js')))
    .pipe(rev())
    .pipe(assets.restore()) // Brings back the previously filtered out HTML files.
    .pipe(useref()) // inject assets
    .pipe(revreplace()) // rewrite any changes to files from the rev above.
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['compile-html']);
