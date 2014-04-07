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

/**
 * Synchronously return the current semver in package.json
 *
 * @returns {String}
 */
function v () {
    return JSON.parse(fs.readFileSync('package.json','utf8')).version;
}

//
// Util tasks
//

    // Clean the build destination folder

    gulp.task('clean-dist',function () {
        return gulp.src('dist',{read:false})
            .pipe(clean());
    });

    // Bump the semver patch number in package.json

    // gulp.task('bump',function () {
    //     return gulp.src('./package.json')
    //         .pipe(bump())
    //         .pipe(gulp.dest('./'));
    // });

//
// HTML tasks
//

    // Inject the main index.html file with <script> tags. Application <script>
    // tags need to be sorted with the files ending '-mod.js' coming at the top,
    // since these are the Angular modules and need to be declared first.

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

    gulp.task('dist-index',function () {
        return gulp.src('src/index.html')
            .pipe(useref.assets())
            .pipe(useref())
            .pipe(gulp.dest('dist'));
    });


    // Copy the main app HTML file into the dist folder and
    // interpolate the current app semver into the text

    // gulp.task('html',function () {
    //     return gulp.src('src/index.html')
    //         .pipe(template({
    //             v: v()
    //         }))
    //         .pipe(gulp.dest('dist'));
    // });

    // Convert all the app HTML templates into one AngularJS
    // module suitable for later concatenating into the main
    // app JS bundle

    gulp.task('templates',function () {
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

    // Copy the static assets to dist

    gulp.task('static',function () {
        return gulp.src('static/**/*')
            .pipe(gulp.dest('dist/static'));
    });

//
// JS tasks
//

    // Lint the JS

    gulp.task('lint',function () {
        var success = true;
        return gulp.src(['src/**/*.js','!src/templates.js'])
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

    // Check the JS code style

    gulp.task('jscs',function () {
        return gulp.src(['src/**/*.js','!src/templates.js'])
            .pipe(jscs({
                rc: '../.jscsrc',
                reporters: ['default','beep']
            }))
    });

    // Concatenate the JS in a defined order (vendor files
    // then AngularJS modules definitions then AngularJS components)
    // into a single main JS bundle. Also convert the dependency
    // injection syntax to the version resistant to uglification

    gulp.task('js',function () {
        var glob = [
            'vendor/angular/angular.js',
            'vendor/angular-route/angular-route.js',
            'src/templates.js',
            'src/**/*mod.js',
            'src/**/*ctrl.js',
            'src/**/*serv.js',
            'src/**/*conf.js',
            'src/**/*run.js',
            'src/**/*const.js',
            'src/**/*dir.js'
        ];
        return gulp.src(glob)
            .pipe(gulpif(/client\/src/g,ngmin()))
            .pipe(concat(v()+'.js'))
            .pipe(gulp.dest('dist/static/js'));
    });

    // Uglify any JS in dist

    gulp.task('uglify-js',function () {
        return gulp.src('dist/static/js/**/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('dist/static/js'));
    });

//
// CSS tasks
//

    // Compile the LESS files

    gulp.task('less',function () {
        return gulp.src('src/less/styles.less')
            .pipe(less())
            // .pipe(rename(v()+'.css'))
            .pipe(gulp.dest('src/css'));
    });

    // Minify the compiled CSS

    gulp.task('minify-css',function () {
        return gulp.src('dist/static/css/**/*.css')
            .pipe(mincss({
                keepSpecialComments: 0
            }))
            .pipe(gulp.dest('dist/static/css'));
    });

//
// Primary tasks
//

    gulp.task('dev',function (cb) {
        sequence('templates',['inject-index','less'],cb);
    });

    gulp.task('dist',['dist-index']);

    // Create a working (non-optimised) build of the
    // app in the dist folder

    // gulp.task('dist',function (cb) {
    //     sequence('clean',['lint','jscs'],'tpl',['html','js','less','static'],cb);
    // });

    // Optimise the built app

    // gulp.task('optimise',['uglify-js','minify-css']);

    // Bump the app version, build it then optimise it

    // gulp.task('release',function (cb) {
    //     sequence('bump','dist','optimise',cb);
    // });

// Watch tasks

    // Main watch task. Watches different sets of files
    // and runs specific tasks against them. Whenever
    // the files have changed in the dist folder then
    // manually trigger a livereload

    gulp.task('watch',/*['dist'],*/function () {



        // gulp.watch('src/index.html',['html']);
        // gulp.watch('src/**/*.js',['lint','jscs']);
        // gulp.watch('src/**/*tpl.html',['tpl']);
        // gulp.watch('src/**/*.js',['js']);
        // gulp.watch('less/**/*.less',['less']);
        // gulp.watch('static/**/*',['static']);

        // var srv = livereload();
        // gulp.watch('dist/**/*')
        //     .on('change',function (file) {
        //         srv.changed(file.path);
        //     });
    });
