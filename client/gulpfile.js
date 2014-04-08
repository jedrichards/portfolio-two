/*

DEV WATCH

- Convert html templates to JS
- Generate index.html, dynamically include <scripts>
- Lint JS, check JS style
- Convert less to css, plus source map


*/


'use strict';

var gulp = require('gulp');
var inject = require('gulp-inject');
var bower = require('gulp-bower-files');
var es = require('event-stream');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var html2js = require('gulp-ng-html2js');
var sequence = require('run-sequence');
var minhtml = require('gulp-minify-html');
var mincss = require('gulp-minify-css');
var livereload = require('gulp-livereload');
var ngmin = require('gulp-ngmin');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var bump = require('gulp-bump');
var fs = require('fs');
var template = require('gulp-template');
var rename = require('gulp-rename');
var lint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var gutil = require('gulp-util');
var map = require('map-stream');
var jscs = require('gulp-jscodesniffer');
var aggtpl = require('./tasks/aggregate-templates');
var useref = require('gulp-useref');
var replace = require('gulp-replace');

/**
 * Synchronously return the current semver in package.json
 *
 * @returns {String}
 */
function v () {
    return JSON.parse(fs.readFileSync('package.json','utf8')).version;
}

//
// Utility tasks
//

    // Clean the build destination folder

    gulp.task('clean-dist',function () {
        return gulp.src('dist',{read:false})
            .pipe(clean());
    });

    // Bump the semver patch number in package.json

    gulp.task('bump',function () {
        return gulp.src('./package.json')
            .pipe(bump())
            .pipe(gulp.dest('./'));
    });

//
// HTML tasks
//

    // Inject the main index.html file with <script> tags. Application <script>
    // tags need to be sorted with the files ending '-mod.js' coming at the top,
    // since these are the Angular module declarations and need to be declared
    // before attaching any components to them.

    gulp.task('inject-index',function () {
        return gulp.src('src/index.html')
            .pipe(inject(gulp.src('src/js/**/*.js',{read:false}),{
                starttag: '<!-- inject:app:{{ext}} -->',
                ignorePath: '/src',
                sort: function (a,b) {
                    a = a.filepath.indexOf('-mod.js');
                    b = b.filepath.indexOf('-mod.js');
                    if ( a > b ) {
                        return -1;
                    } else if ( a < b ) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }))
            .pipe(inject(bower({read:false}),{
                starttag: '<!-- inject:vendor:{{ext}} -->',
                ignorePath: '/src'
            }))
            .pipe(gulp.dest('src'));
    });

    // Copy the main index.html file to the dist folder and interpolate the
    // current app version into the file contents

    gulp.task('dist-index',function () {
        var ver = v();
        return gulp.src('src/index.html')
            .pipe(useref())
            .pipe(replace(/APP_VERSION = 'dev'/,'APP_VERSION = \'v'+ver+'\''))
            .pipe(replace(/\/css\/styles.css/,'/v'+ver+'/css/styles.css'))
            .pipe(replace(/\/js\/bundle.js/,'/v'+ver+'/js/bundle.js'))
            .pipe(gulp.dest('dist'));
    });

    // Convert all the app HTML templates into one AngularJS module

    gulp.task('gen-template-js',function () {
        return gulp.src('src/js/**/*.html')
            .pipe(minhtml({
                empty: true,
                spare: true,
                quotes: true
            }))
            .pipe(html2js({
                rename: function (url) {
                    return url.split('/').pop();
                }
            }))
            .pipe(concat('templates-mod.js'))
            .pipe(aggtpl('templates-mod'))
            .pipe(gulp.dest('src/js'));
    });

//
// Static asset tasks
//

    // Copy non-JS static assets to dist

    gulp.task('dist-static',function () {
        return gulp.src(['src/**/*.jpg','src/**/*.png','src/**/*.css','!src/vendor/**/*'])
            .pipe(gulp.dest('dist'));
    });

//
// JS tasks
//

    // Lint the JS with JSHint. It should pick up the '.jshintrc' file at the
    // root of the project. Exclude the 'templates-mod.js' file since this is
    // generated.

    gulp.task('lint-js',function () {
        var success = true;
        return gulp.src(['src/js/**/*.js','!src/js/templates-mod.js'])
            .pipe(lint())
            .pipe(lint.reporter(stylish))
            .pipe(map(function (file,cb) {
                if ( !file.jshint.success ) success = false;
                cb(null,file);
            }))
            .on('end',function () {
                if ( !success ) gutil.beep();
            });
    });

    // Check the JS code style with JSCodeSniffer. It uses the '.jscsrc' file at
    // the root of the project. Exclude the 'templates-mod.js' file since this is
    // generated.

    gulp.task('js-style',function () {
        return gulp.src(['src/js/**/*.js','!src/js/templates-mod.js'])
            .pipe(jscs({
                rc: '../.jscsrc',
                reporters: ['default','beep']
            }))
    });

    // Concatenate any JS referenced in the main index.html file's <script>
    // tags into a single bundle and copy to dist.

    gulp.task('bundle-js',function () {
        return gulp.src('src/index.html')
            .pipe(useref.assets())
            .pipe(gulp.dest('dist'));
    });

    // Uglify any JS in dist

    gulp.task('uglify-js',function () {
        return gulp.src('dist/js/**/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('dist/js'));
    });

//
// CSS tasks
//

    // Compile the LESS files into src

    gulp.task('less',function () {
        return gulp.src('src/less/styles.less')
            .pipe(less())
            .pipe(gulp.dest('src/css'));
    });

    // Minify any CSS in dist

    gulp.task('minify-css',function () {
        return gulp.src('dist/**/*.css')
            .pipe(mincss({
                keepSpecialComments: 0
            }))
            .pipe(gulp.dest('dist'));
    });

//
// Primary tasks
//

    // Run all tasks related to processing files in the 'src' folder during
    // day-to-day developement

    gulp.task('src',function (cb) {
        sequence('lint-js','js-style','gen-template-js',['inject-index','less'],cb);
    });

    // Generate an optimised version of the app in the 'dist' folder

    gulp.task('dist',function (cb) {
        sequence('src','clean-dist','dist-static',['minify-css','bundle-js','dist-index'],'uglify-js',cb);
    });

    // Bump the app version in package.json before running the 'dist' task

    gulp.task('release',function (cb) {
        sequence('bump','dist',cb);
    });

// Watch tasks

    // Main watch task. Watches different sets of files and runs specific tasks
    // against them.

    gulp.task('watch',['src'],function () {

        gulp.watch('src/js/**/*.js',['lint-js','js-style','inject-index']);
        gulp.watch('src/js/**/*-tpl.html',['gen-template-js']);
        gulp.watch('src/less/**/*.less',['less']);

        var srv = livereload();
        gulp.watch(['src/js/**/*.js','src/css/**/*.css'])
            .on('change',function (file) {
                srv.changed(file.path);
            });
    });
