# github-star

Star, unstar, or check if you starred a repository or the repositories associated with NPM, Bower, or Meteor package file dependencies on GitHub

## CLI

#### Installation

```
npm i -g github-star
```

#### Usage

githubstar [options]

    -h, --help            output usage information
    -V, --version         output the version number
    -s, --repostar        star a GitHub repository
    -u, --repounstar      unstar a GitHub repository
    -i, --repoisstarred   check if a GitHub repository is starred
    -S, --depsstar        star dependencies in an NPM, Bower, or Meteor package file on GitHub
    -U, --depsunstar      unstar dependencies in an NPM, Bower, or Meteor package file on GitHub
    -A, --depsarestarred  check if dependencies in an NPM, Bower, or Meteor package file are starred on GitHub
    -d, --skipdeps        skip dependencies (has no effect when --package is supplied, or when --depspath is supplied and it is a Meteor package file)
    -D, --skipdevdeps     skip devDependencies (has no effect when --package is supplied, or when --depspath is supplied and it is a Meteor package file)
    -z, --skipself        skip repos belonging to --username (or the GITHUB_USERNAME environment variable) when supplying --depsstar, --depsunstar, or --depsarestarred
    -x, --skipauthor <x>  an author to skip when supplying --depsstar, --depsunstar, or --depsarestarred (repeatable)
    -X, --skiprepo <X>    a repo to skip when supplying --depsstar, --depsunstar, or --depsarestarred (repeatable)
    -P, --package <P>     an NPM, Bower, or Atmosphere dependency (repeatable; must be supplied when not using --depspath)
    -n, --username <n>    a GitHub username (may be ommitted if the GITHUB_USERNAME environment variable is set)
    -t, --token <t>       a GitHub personal access token or password belonging to --username (may be ommitted if GITHUB_TOKEN environment variable is set)
    -p, --password <p>    a GitHub password or personal access token belonging to --username (may be ommitted if GITHUB_TOKEN environment variable is set)
    -a, --author <a>      a GitHub author (must be supplied when providing --repostar, --repounstar, or --repoisstarred)
    -r, --repo <r>        a repository belonging to --author (must be supplied when providing --repostar, --repounstar, or --repoisstarred)
    -j, --depspath <j>    a path to an NPM, Bower, or Meteor package file (must be supplied when not providing --package)
    -T, --type <T>        the package manager associated with --depspath or --package: NPM, Bower, or Atmosphere (case-insensitive; must be supplied for NPM or Bower dependencies when providing --package; must be supplied for Bower dependencies when providing --depspath, unless the file name is "bower.json")

__Examples__

Manually supply a username / password and star a single repo:
```
githubstar -u user -p password -s -a sindresorhus -r package-json
```

Authenticate using environment variables and star all of the dependencies in a `package.json` file, skipping repositories that belong to the specified author:
```
githubstar --depsstar --depspath package.json --skipauthor npm
```

## API

`gitHubStar.repository` methods are supported in RequireJS, CommonJS, and global environments. `gitHubStar.dependencies` methods are only supported in CommonJS environments.

#### GitHubStar(```username```, ```tokenOrPassword```)

Instantiate github-star

* string [`username`] - A GitHub username (may be omitted if the GITHUB_USERNAME environment variable is set)
* string [`tokenOrPassword`] - A GitHub personal access token (recommended) or password belonging to `username` (may be omitted if the GITHUB_TOKEN environment variable is set)

__Example (CommonJS)__

```
var GitHubStar = require('github-star'),
    gitHubStar = GitHubStar('username', 'token');
```

#### gitHubStar.repository.star(```author```, ```repo```, ```cb```)

Star a GitHub repository

* string `author` - A GitHub author
* string `repo` - A repository belonging to `author`
* function(null | object `err`) `cb` - A function to be executed after the repository is starred

__Example__

```
gitHubStar.repository.star('mjhasbach', 'github-star', function(err){
    if (err) { console.error(err); }
});
```

#### gitHubStar.repository.unstar(```author```, ```repo```, ```cb```)

Unstar a GitHub repository

* string `author` - A GitHub author
* string `repo` - A repository belonging to `author`
* function(null | object `err`) `cb` - A function to be executed after the repository is unstarred

__Example__

```
gitHubStar.repository.unstar('lodash', 'lodash', function(err){
    if (err) { console.error(err); }
});
```

#### gitHubStar.repository.isStarred(```author```, ```repo```, ```cb```)

Check if a GitHub repository is starred

* string `author` - A GitHub author
* string `repo` - A repository belonging to `author`
* function(null | object `err`, boolean `isStarred`) `cb` - A function to be executed after the repository is checked

__Example__

```
gitHubStar.repository.isStarred('gulpjs', 'gulp', function(err, isStarred){
    if (err) { console.error(err); }
    
    console.log(isStarred);
});
```

#### gitHubStar.dependencies.star(```opt```, ```cb```)

Star dependencies in an NPM, Bower, or Meteor package file on GitHub.

* object `opt` - An options object
    * string [`depsPath`] - A path to an NPM, Bower, or Meteor package file. Must be supplied if `depsList` is not supplied.
    * array{string} [`depsList`] - An array containing NPM, Bower, or Meteor package names. Must be supplied if `depsPath` is not supplied.
    * boolean [`dependencies`] - If false, dependencies will not be starred. Has no effect when `depsList` is supplied, or when `depsPath` is supplied and it is a Meteor package file.
    * boolean [`devDependencies`] - If false, devDependencies will not be starred. Has no effect when `depsList` is supplied, or when `depsPath` is supplied and it is a Meteor package file.
    * string [`type`] - The package manager associated with `depsPath` or `depsList`: "NPM", "Bower", or "Atmosphere" (case-insensitive). Must be supplied for NPM or Bower dependencies when providing `depsList`. Must be supplied for Bower dependencies when providing `depsPath`, unless the file name is "bower.json".
    * boolean [`skipSelf`] - Skip repos belonging to `username` if true
    * array{string} [`skippedAuthors`] - Authors to skip
    * array{string} [`skippedRepos`] - Repos to skip
* function(null | object `err`, object{boolean} `wereStarred`) `cb` - A function to be executed after the dependencies are starred. Errors for individual dependencies (e.g. not found on package manager) will be `Error` objects in the wereStarred object. 

__Example__

```
// Using depsPath
gitHubStar.dependencies.star({
    depsPath: './some_file.json',
    dependencies: true,
    devDependencies: false,
    type: "Bower",
    skipSelf: true,
    skippedAuthors: ['angular', 'jquery'],
    skippedRepos: ['lodash', 'backbone']
}, function(err, wereStarred){
    if (err) {
        console.error(err);
    }

    _.each(wereStarred, function(wasStarred, dependency) {
        if (wasStarred instanceof Error) {
            console.error(wasStarred);
            return;
        }
        
        console.log(dependency + ' was ' + (wasStarred ? '' : 'not ') + 'starred');
    });
});

// Using depsList
gitHubStar.dependencies.star({
    depsList: [
        'flemay:less-autoprefixer',
        'stevezhu:lodash',
        'suxez:jquery-serialize-object'
    ],
    type: "Atmosphere",
    skippedAuthors: ['flemay'],
    skippedRepos: ['lodash']
}, function(err, wereStarred){
    if (err) {
        console.error(err);
    }

    _.each(wereStarred, function(wasStarred, dependency) {
        if (wasStarred instanceof Error) {
            console.error(wasStarred);
            return;
        }
        
        console.log(dependency + ' was ' + (wasStarred ? '' : 'not ') + 'starred');
    });
});
```

#### gitHubStar.dependencies.unstar(```opt```, ```cb```)

Unstar dependencies in an NPM, Bower, or Meteor package file on GitHub.

* object `opt` - An options object
    * string [`depsPath`] - A path to an NPM, Bower, or Meteor package file. Must be supplied if `depsList` is not supplied.
    * array{string} [`depsList`] - An array containing NPM, Bower, or Meteor package names. Must be supplied if `depsPath` is not supplied.
    * boolean [`dependencies`] - If false, dependencies will not be unstarred. Has no effect when `depsList` is supplied, or when `depsPath` is supplied and it is a Meteor package file.
    * boolean [`devDependencies`] - If false, devDependencies will not be unstarred. Has no effect when `depsList` is supplied, or when `depsPath` is supplied and it is a Meteor package file.
    * string [`type`] - The package manager associated with `depsPath` or `depsList`: "NPM", "Bower", or "Atmosphere" (case-insensitive). Must be supplied for NPM or Bower dependencies when providing `depsList`. Must be supplied for Bower dependencies when providing `depsPath`, unless the file name is "bower.json".
    * boolean [`skipSelf`] - Skip repos belonging to `username` if true
    * array{string} [`skippedAuthors`] - Authors to skip
    * array{string} [`skippedRepos`] - Repos to skip
* function(null | object `err`, object{boolean} `wereUnstarred`) `cb` - A function to be executed after the dependencies are unstarred. Errors for individual dependencies (e.g. not found on package manager) will be `Error` objects in the wereUnstarred object.

__Example__

```
// Using depsPath

gitHubStar.dependencies.unstar({
    depsPath: './some_file.json',
    dependencies: true,
    devDependencies: false,
    type: "Bower",
    skipSelf: true,
    skippedAuthors: ['angular', 'jquery'],
    skippedRepos: ['lodash', 'backbone']
}, function(err, wereUnstarred){
    if (err) {
        console.error(err);
    }

    _.each(wereUnstarred, function(wasUnstarred, dependency) {
        if (wasUnstarred instanceof Error) {
            console.error(wasUnstarred);
            return;
        }
        
        console.log(dependency + ' was ' + (wasUnstarred ? '' : 'not ') + 'unstarred');
    });
});

// Using depsList
gitHubStar.dependencies.unstar({
    depsList: [
        'flemay:less-autoprefixer',
        'stevezhu:lodash',
        'suxez:jquery-serialize-object'
    ],
    type: "Atmosphere",
    skippedAuthors: ['flemay'],
    skippedRepos: ['lodash']
}, function(err, wereUnstarred){
    if (err) {
        console.error(err);
    }

    _.each(wereUnstarred, function(wasUnstarred, dependency) {
        if (wasUnstarred instanceof Error) {
            console.error(wasUnstarred);
            return;
        }
        
        console.log(dependency + ' was ' + (wasUnstarred ? '' : 'not ') + 'unstarred');
    });
});
```

#### gitHubStar.dependencies.areStarred(```opt```, ```cb```)

Check if dependencies in an NPM, Bower, or Meteor package file are starred on GitHub.

* object `opt` - An options object
    * string [`depsPath`] - A path to an NPM, Bower, or Meteor package file. Must be supplied if `depsList` is not supplied.
    * array{string} [`depsList`] - An array containing NPM, Bower, or Meteor package names. Must be supplied if `depsPath` is not supplied.
    * boolean [`dependencies`] - If false, dependencies will not be checked. Has no effect when `depsList` is supplied, or when `depsPath` is supplied and it is a Meteor package file.
    * boolean [`devDependencies`] - If false, devDependencies will not be checked. Has no effect when `depsList` is supplied, or when `depsPath` is supplied and it is a Meteor package file.
    * string [`type`] - The package manager associated with `depsPath` or `depsList`: "NPM", "Bower", or "Atmosphere" (case-insensitive). Must be supplied for NPM or Bower dependencies when providing `depsList`. Must be supplied for Bower dependencies when providing `depsPath`, unless the file name is "bower.json".
    * boolean [`skipSelf`] - Skip repos belonging to `username` if true
    * array{string} [`skippedAuthors`] - Authors to skip
    * array{string} [`skippedRepos`] - Repos to skip
* function(null | object `err`, object{boolean} `areStarred`) `cb` - A function to be executed after the dependencies are checked. Errors for individual dependencies (e.g. not found on package manager) will be `Error` objects in the areStarred object.

__Example__

```
// Using depsPath
gitHubStar.dependencies.areStarred({
    depsPath: './some_file.json',
    dependencies: true,
    devDependencies: false,
    type: "Bower",
    skipSelf: true,
    skippedAuthors: ['angular', 'jquery'],
    skippedRepos: ['lodash', 'backbone']
}, function(err, areStarred){
    if (err) {
        console.error(err);
    }

    _.each(areStarred, function(isStarred, dependency) {
        if (isStarred instanceof Error) {
            console.error(isStarred);
            return;
        }
        
        console.log(dependency + ' is ' + (isStarred ? '' : 'not ') + 'starred');
    });
});

// Using depsList
gitHubStar.dependencies.areStarred({
    depsList: [
        'flemay:less-autoprefixer',
        'stevezhu:lodash',
        'suxez:jquery-serialize-object'
    ],
    type: "Atmosphere",
    skippedAuthors: ['flemay'],
    skippedRepos: ['lodash']
}, function(err, areStarred){
    if (err) {
        console.error(err);
    }

    _.each(areStarred, function(isStarred, dependency) {
        if (isStarred instanceof Error) {
            console.error(isStarred);
            return;
        }
        
        console.log(dependency + ' is ' + (isStarred ? '' : 'not ') + 'starred');
    });
});
```

# Installation
### Npm
```
npm i github-star
```
### Bower
```
bower i github-star
```

# Testing
```
npm test
```