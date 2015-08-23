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
    collectSkipped = function(authorOrRepo, skipped){
        skipped.push(authorOrRepo);
        return skipped;
    };

cli
    .version(require('../package.json').version)
    .usage('[options]')
    .option('-s, --repostar', 'star a GitHub repository')
    .option('-u, --repounstar', 'unstar a GitHub repository')
    .option('-i, --repoisstarred', 'check if a GitHub repository is starred')
    .option('-S, --depsstar', 'star all of the dependencies in a package.json, bower.json, or similar file on GitHub')
    .option('-U, --depsunstar', 'unstar all of the dependencies in a package.json, bower.json, or similar file on GitHub')
    .option('-A, --depsarestarred', 'check if all of the dependencies in a package.json, bower.json, or similar file are starred on GitHub')
    .option('-n, --username <n>', 'a GitHub username')
    .option('-t, --token <t>', 'a GitHub personal access token or password belonging to --username')
    .option('-p, --password <p>', 'a GitHub password or personal access token belonging to --username')
    .option('-a, --author <a>', 'a GitHub author')
    .option('-r, --repo <r>', 'a repository belonging to --author')
    .option('-j, --jsonpath <j>', 'a path to a package.json, bower.json, or similar file')
    .option('-z, --skipself', 'skip repos belonging to --username')
    .option('-x, --skipauthor [x]', 'an author to skip when starring / unstarring dependencies (repeatable)', collectSkipped, [])
    .option('-X, --skiprepo [X]', 'a repo to skip when starring / unstarring dependencies (repeatable)', collectSkipped, [])
    .parse(process.argv);

var gitHubStar = GitHubStar(cli.username, cli.token || cli.password);

if (cli.repostar){
    gitHubStar.repository.star(cli.author, cli.repo, function(err){
        if (err) { console.error(err); }
    });

    return;
}

if (cli.repounstar){
    gitHubStar.repository.unstar(cli.author, cli.repo, function(err){
        if (err) { console.error(err); }
    });

    return;
}

if (cli.repoisstarred){
    gitHubStar.repository.isStarred(cli.author, cli.repo, function(err, isStarred){
        if (err) { console.error(err); }
        else { console.log(isStarred); }
    });

    return;
}

if (cli.depsstar){
    gitHubStar.dependencies.star({
        jsonPath: cli.jsonpath,
        skipSelf: cli.skipself,
        skippedAuthors: cli.skipauthor,
        skippedRepos: cli.skiprepo
    }, function(err){
        if (err) { console.error(err); }
    });

    return;
}

if (cli.depsunstar){
    gitHubStar.dependencies.unstar({
        jsonPath: cli.jsonpath,
        skipSelf: cli.skipself,
        skippedAuthors: cli.skipauthor,
        skippedRepos: cli.skiprepo
    }, function(err){
        if (err) { console.error(err); }
    });

    return;
}

if (cli.depsarestarred){
    gitHubStar.dependencies.areStarred(cli.jsonpath, function(err, areStarred){
        if (err) { console.error(err); }
        else { console.log(areStarred); }
    });

    return;
}

console.error(new Error('One of the following options must be supplied: ' + methods.join(', ')));