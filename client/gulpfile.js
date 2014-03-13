var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var html2js = require('gulp-ng-html2js');
var sequence = require('run-sequence');
var minhtml = require('gulp-minify-html');
var livereload = require('gulp-livereload');
var ngmin = require('gulp-ngmin');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');

var ops = {
	minhtml: {
		empty: true,
		spare: true,
		quotes: true
	},
	html2js: {
		moduleName: 'templates',
		rename: function (url) {
			return url.split('/').pop();
		}
	}
};

gulp.task('clean',function () {
	return gulp.src('dist/',{read:false})
		.pipe(clean());
});

gulp.task('html',function () {
	return gulp.src('src/index.html')
		.pipe(gulp.dest('dist'));
});

gulp.task('tpl',function () {
	return gulp.src('src/**/*-tpl.html')
		.pipe(minhtml(ops.minhtml))
		.pipe(html2js(ops.html2js))
		.pipe(concat('templates-module.js'))
		.pipe(gulp.dest('src/templates'));
});

gulp.task('js',['tpl'],function () {
	var glob = [
		'vendor/angular/angular.js',
		'src/**/*-module.js',
		'src/**/*-controller.js'
	];
	return gulp.src(glob)
		.pipe(gulpif(/client\/src/g,ngmin()))
		.pipe(concat('app.js'))
		.pipe(gulp.dest('dist/static/js'))
		.pipe(livereload());
});

gulp.task('optimise-js',function () {
	return gulp.src('dist/static/js/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist/static/js'));
});

gulp.task('optimise',['optimise-js']);

gulp.task('dist',function (cb) {
	sequence('clean',['html','js'],cb);
});

gulp.task('watch',['dist'],function () {
	var glob = [
		'src/**/*.js',
		'src/**/*.html',
		'vendor/**/*.js'
	];
	gulp.watch(glob,['dist']);
});
