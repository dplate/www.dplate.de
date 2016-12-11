const { PolymerProject } = require('polymer-build');
const mergeStream = require('merge-stream');
const gulp = require('gulp');

const project = new PolymerProject(require('../polymer.json'));
mergeStream(project.sources(), project.dependencies())
  .pipe(project.analyzer)
  .pipe(project.bundler)
  .pipe(gulp.dest('build/'));