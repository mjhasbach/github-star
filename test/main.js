var fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    revert = require('./revert'),
    prompt = require('prompt-sync')();

console.log('Warning: These tests will star / unstar GitHub repositories using ' +
            'your GitHub account and attempt to reverse the changes afterwards.');

var consent = prompt('Would you like to proceed? y/N: ');

if (_.result(consent, 'toLowerCase') === 'y') {
    var note = 'Thanks. You may set the % environment variable in order to avoid typing this again in the future.';

    if (!process.env.GITHUB_USERNAME) {
        var username = prompt('Please enter your GitHub username:');

        console.log(note.replace('%', 'GITHUB_USERNAME'));
    }

    if (!process.env.GITHUB_TOKEN) {
        var password = prompt('Please enter your GitHub token or password:');

        console.log(note.replace('%', 'GITHUB_TOKEN'));
    }

    global.should = require('chai').should();

    global.gitHubStar = require('../lib/githubStar')(username, password);

    before(function(done) {
        revert.analyze().then(done).catch((err) => {
            throw err;
        });
    });

    after(function(done) {
        revert.undo().then(done).catch((err) => {
            throw err;
        });
    });
}
else {
    console.log('Aborting because you did not answer the previous question with "y" (case-insensitive).');
    process.exit();
}