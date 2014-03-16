'use strict';

var gulp = require('gulp');
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
var plumber = require('gulp-plumber');
var map = require('map-stream');

function v () {
    return JSON.parse(fs.readFileSync('package.json','utf8')).version;
}

// Util tasks

    // Clean the build destination folder

    gulp.task('clean',function () {
        return gulp.src('dist',{read:false})
            .pipe(clean());
    });

    // Bump the semver patch number in package.json

    gulp.task('bump',function () {
        return gulp.src('./package.json')
            .pipe(bump())
            .pipe(gulp.dest('./'));
    });

// HTML tasks

    // Copy the main app HTML file into the dist folder and
    // interpolate the current app semver into the text

    gulp.task('html',function () {
        return gulp.src('src/index.html')
            .pipe(template({
                v: v()
            }))
            .pipe(gulp.dest('dist'));
    });

    // Convert all the app HTML templates into one AngularJS
    // module suitable for later concatenating into the main
    // app JS bundle

    gulp.task('tpl',function () {
        return gulp.src('src/**/*-tpl.html')
            .pipe(minhtml({
                empty: true,
                spare: true,
                quotes: true
            }))
            .pipe(html2js({
                moduleName: 'templates',
                rename: function (url) {
                    return url.split('/').pop();
                }
            }))
            .pipe(concat('templates-module.js'))
            .pipe(gulp.dest('src/templates'));
    });

// JS tasks

    // Lint the JS

    gulp.task('lint',function () {
        var success = true;
        return gulp.src(['gulpfile.js','src/app/**/*.js'])
            .pipe(lint())
            .pipe(lint.reporter(stylish))
            .pipe(map(function (file,cb) {
                if ( !file.jshint.success ) {
                    success = false;
                }
                cb(null,file);
            }))
            .on('end',function () {
                if ( !success ) gutil.beep();
            });
    });

    // Concatenate the JS in a defined order (vendor files
    // then AngularJS modules then AngularJS components) into
    // a single main JS bundle. Also convert the dependency
    // injection syntax to the version resistant to uglification

    gulp.task('js',['tpl'],function () {
        var glob = [
            'vendor/angular/angular.js',
            'src/**/*-module.js',
            'src/**/*-controller.js'
        ];
        return gulp.src(glob)
            .pipe(gulpif(/client\/src/g,ngmin()))
            .pipe(concat(v()+'.js'))
            .pipe(gulp.dest('dist/static/js'));
    });

    // Uglify the main JS app file

    gulp.task('uglify-js',function () {
        return gulp.src('dist/static/js/**/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('dist/static/js'));
    });

// CSS tasks

    // Compile the LESS files

    gulp.task('less',function () {
        return gulp.src('less/styles.less')
            .pipe(less())
            .pipe(rename(v()+'.css'))
            .pipe(gulp.dest('dist/static/css/'));
    });

    // Minify the compiled CSS

    gulp.task('minify-css',function () {
        return gulp.src('dist/static/css/**/*.css')
            .pipe(mincss({
                keepSpecialComments: 0
            }))
            .pipe(gulp.dest('dist/static/css'));
    });

// Primary composite tasks

    // Build the app into the dist folder

    gulp.task('dist',function (cb) {
        sequence('clean','test',['html','js','less'],cb);
    });

    // Optimise the built app

    gulp.task('optimise',['uglify-js','minify-css']);

    // Bump the app version, build it and optimise it

    gulp.task('release',function (cb) {
        sequence('bump','dist','optimise',cb);
    });

// Watch tasks

    // Main watch task.

    gulp.task('watch',['dist'],function () {
        var srv = livereload();
        gulp.watch('src/index.html',['html']);
        gulp.watch('src/app/**/*.js',['lint']);
        gulp.watch(['src/**/*.js','src/**/*-tpl.html'],['js']);
        gulp.watch('less/**/*.less',['less']);
        gulp.watch(['dist/**/*'])
            .on('change',function (file) {
                srv.changed(file.path);
            });
    });
