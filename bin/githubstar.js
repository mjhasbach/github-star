#!/usr/bin/env node

var cli = require('commander'),
    GitHubStar = require('../lib/githubStar.js');

var methods = [
        '--repostar',
        '--repounstar',
        '--repoisstarred',
        '--depsstar',
        '--depsunstar',
        '--depsarestarred'
    ],
    collectRepeatable = (repeatable, repeatables) => {
        repeatables.push(repeatable);
        return repeatables;
    };

cli
    .version(require('../package.json').version)
    .usage('[options]')
    .option('-s, --repostar', 'star a GitHub repository')
    .option('-u, --repounstar', 'unstar a GitHub repository')
    .option('-i, --repoisstarred', 'check if a GitHub repository is starred')
    .option('-S, --depsstar', 'star dependencies in an NPM, Bower, or Meteor package file on GitHub')
    .option('-U, --depsunstar', 'unstar dependencies in an NPM, Bower, or Meteor package file on GitHub')
    .option('-A, --depsarestarred', 'check if dependencies in an NPM, Bower, or Meteor package file are starred on GitHub')
    .option('-d, --skipdeps', 'skip dependencies (has no effect when --package is supplied, or when --depspath is supplied and it is a Meteor package file)')
    .option('-D, --skipdevdeps', 'skip devDependencies (has no effect when --package is supplied, or when --depspath is supplied and it is a Meteor package file)')
    .option('-z, --skipself', 'skip repos belonging to --username (or the GITHUB_USERNAME environment variable) when supplying --depsstar, --depsunstar, or --depsarestarred')
    .option('-x, --skipauthor <x>', 'an author to skip when supplying --depsstar, --depsunstar, or --depsarestarred (repeatable)', collectRepeatable, [])
    .option('-X, --skiprepo <X>', 'a repo to skip when supplying --depsstar, --depsunstar, or --depsarestarred (repeatable)', collectRepeatable, [])
    .option('-P, --package <P>', 'an NPM, Bower, or Atmosphere dependency (repeatable; must be supplied when not using --depspath)', collectRepeatable, [])
    .option('-n, --username <n>', 'a GitHub username (may be ommitted if the GITHUB_USERNAME environment variable is set)')
    .option('-t, --token <t>', 'a GitHub personal access token or password belonging to --username (may be ommitted if GITHUB_TOKEN environment variable is set)')
    .option('-p, --password <p>', 'a GitHub password or personal access token belonging to --username (may be ommitted if GITHUB_TOKEN environment variable is set)')
    .option('-a, --author <a>', 'a GitHub author (must be supplied when providing --repostar, --repounstar, or --repoisstarred)')
    .option('-r, --repo <r>', 'a repository belonging to --author (must be supplied when providing --repostar, --repounstar, or --repoisstarred)')
    .option('-j, --depspath <j>', 'a path to an NPM, Bower, or Meteor package file (must be supplied when not providing --package)')
    .option('-T, --type <T>', 'the package manager associated with --depspath or --package: NPM, Bower, or Atmosphere (case-insensitive; must be supplied for NPM or Bower dependencies when providing --package; must be supplied for Bower dependencies when providing --depspath, unless the file name is "bower.json")')
    .parse(process.argv);

var gitHubStar = GitHubStar(cli.username, cli.token || cli.password),
    dependencyMethodOpt = {
        depsPath: cli.depspath,
        depsList: cli.package,
        dependencies: !cli.skipdeps,
        devDependencies: !cli.skipdevdeps,
        type: cli.type,
        skipSelf: cli.skipself,
        skippedAuthors: cli.skipauthor,
        skippedRepos: cli.skiprepo
    };

if (cli.repostar) {
    gitHubStar.repository.star(cli.author, cli.repo, (err) => {
        if (err) { console.error(err); }
    });

    return;
}

if (cli.repounstar) {
    gitHubStar.repository.unstar(cli.author, cli.repo, (err) => {
        if (err) { console.error(err); }
    });

    return;
}

if (cli.repoisstarred) {
    gitHubStar.repository.isStarred(cli.author, cli.repo, (err, isStarred) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(isStarred);
    });

    return;
}

if (cli.depsstar) {
    gitHubStar.dependencies.star(dependencyMethodOpt, (err, wereStarred) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(JSON.stringify(wereStarred));
    });

    return;
}

if (cli.depsunstar) {
    gitHubStar.dependencies.unstar(dependencyMethodOpt, (err, wereUnstarred) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(JSON.stringify(wereUnstarred));
    });

    return;
}

if (cli.depsarestarred) {
    gitHubStar.dependencies.areStarred(dependencyMethodOpt, (err, areStarred) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(JSON.stringify(areStarred));
    });

    return;
}

console.error(new Error('One of the following options must be supplied: ' + methods.join(', ')));