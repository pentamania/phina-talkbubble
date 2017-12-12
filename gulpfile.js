'use strict';

var gulp = require('gulp');
var header = require('gulp-header');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');
var pump = require('pump');

var pkg = require('./package.json');
var config = require('./config.js');

var banner = [
  "/*! ",
  " * <%= pkg.name %> <%= pkg.version %>",
  " * <%= pkg.license %> Licensed",
  " * ",
  " * Copyright (C) <%= pkg.author %>, <%= pkg.homepage %>",
  " */",
  "",
  "",
].join('\n');
var scripts = config.files.map(function(f) {
  return config.srcPath + "/" + f;
});


// ==============================
// gulptasks
// ==============================

gulp.task('clean', function(cb) {
  return del([
    config.outPath + '/**/*',
  ], cb);
});

gulp.task('concat', ['clean'], function() {
  return gulp
    .src(scripts)
    .pipe(concat(config.outFileName))
    .pipe(header(banner, {
      pkg: pkg,
    }))
    .pipe(gulp.dest(config.outPath))
    ;
});

gulp.task('uglify', ['concat'], function(cb) {
  pump([
      gulp.src(scripts),
      concat(config.outFileName),
      uglify(),
      header(banner, {
        pkg: pkg,
      }),
      rename({
        extname: '.min.js'
      }),
      gulp.dest(config.outPath)
    ],
    cb
  );
});

gulp.task('watch', ['concat'], function() {
  gulp.watch(config.srcPath+'/**/*.js', ['concat']);
});

gulp.task('default', ['uglify']);