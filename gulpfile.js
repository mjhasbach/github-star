var _ = require('lodash'),
    gulp = require('gulp'),
    git = require('gulp-git'),
    prompt = require('prompt'),
    bump = require('gulp-bump'),
    exec = require('child_process').exec,
    release = require('publish-release'),
    runSequence = require('run-sequence');

var version;

gulp.task('bump', function() {
    return gulp.src('*.json')
        .pipe(bump())
        .pipe(gulp.dest('.'));
});

gulp.task('commitBump', function() {
    version = require('./package').version;

    return gulp.src('*.json')
        .pipe(git.commit('Released version ' + version));
});

gulp.task('pushBump', function(cb) {
    git.push('origin', 'master', function(err) {
        if (err) { throw err; }
        cb();
    });
});

gulp.task('githubRelease', function(cb) {
    var notesKey = 'release notes';

    if (!_.isString(version)) {
        version = require('./package').version;
    }

    prompt.start();

    prompt.get([notesKey], function(err, result) {
        if (err) { throw err; }

        release({
            token: require('./githubToken.js'),
            owner: 'mjhasbach',
            repo: 'github-star',
            tag: version,
            name: 'Version ' + version,
            notes: result[notesKey],
            draft: false,
            prerelease: false
        }, function(err) {
            if (err) { throw err; }
            cb();
        });
    });
});

gulp.task('npmPublish', function(cb) {
    exec('npm publish', function(err) {
        if (err) { throw err.message; }
        cb();
    });
});

gulp.task('release', function(cb) {
    runSequence('bump', 'commitBump', 'pushBump', 'githubRelease', 'npmPublish', cb);
});