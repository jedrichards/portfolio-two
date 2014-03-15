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

function v () {
    return JSON.parse(fs.readFileSync('package.json','utf8')).version;
}

// Deletes the contents of the dist folder.

gulp.task('clean',function () {
    return gulp.src('dist',{read:false})
        .pipe(clean());
});

// Processes the main application HTML file and copies it to the dist folder.

gulp.task('html',function () {
    return gulp.src('src/index.html')
        .pipe(template({
            v: v()
        }))
        .pipe(gulp.dest('dist'));
});

// Gathers all the application html templates into one JS file suitable for
// later concatenating into the main application JS file.

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

// Concatenates all the application JS files into the main application JS file.
// Angular module declarations are concatenated first since they need to come
// before they're first used. Non-vendor JS is run through ngmin to process the
// dependency injection style into the minification resistant syntax. The 'tpl'
// task is set as a dependency to ensure that template module has been generated
// prior to this task being run.

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

// Uglify the JS in the dist folder.

gulp.task('uglify-js',function () {
    return gulp.src('dist/static/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/static/js'));
});

gulp.task('less',function () {
    return gulp.src('less/styles.less')
        .pipe(less())
        .pipe(rename(v()+'.css'))
        .pipe(gulp.dest('dist/static/css/'));
});

gulp.task('minify-css',function () {
    return gulp.src('dist/static/css/**/*.css')
        .pipe(mincss({
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest('dist/static/css'));
});

// Runs all the optimisation tasks together.

gulp.task('optimise',['uglify-js','minify-css']);

// Bump

gulp.task('bump',function () {
    return gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

// Main dist task, runs all the tasks required to generate a working version of
// the application into the dist folder.

gulp.task('dist',function (cb) {
    sequence('clean',['html','js','less'],cb);
});

gulp.task('release',function (cb) {
    sequence('bump','dist','optimise',cb);
});

// Watch task. Watches source files and runs appropriate tasks. Also watches
// dist folder in order to trigger a live reload.

gulp.task('watch',['dist'],function () {
    var srv = livereload();
    gulp.watch('src/index.html',['html']);
    gulp.watch(['src/**/*.js','src/**/*-tpl.html'],['js']);
    gulp.watch('less/**/*.less',['less']);
    gulp.watch(['dist/**/*'])
        .on('change',function (file) {
            srv.changed(file.path);
        });
});
