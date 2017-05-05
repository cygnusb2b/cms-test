var
  gulp = require('gulp'),
  spawn = require('child_process').spawn,
  node,
  watchedPaths = [
    'src/**/*.js'
  ]
;

gulp.task('serve', function(cb) {
  if (node) {
    node.kill();
  }

  node = spawn('node', ['src/app.js'], {stdio: 'inherit'});

  node.on('close', function (code) {
    if (code === 8) {
      cb(code);
      console.log('Error detected, waiting for changes...');
    }
  });
    cb();
})

gulp.task('watch', function() {
  gulp.watch(watchedPaths, ['serve']);
})

gulp.task('default', ['watch', 'serve']);

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
})
