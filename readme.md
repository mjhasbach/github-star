# github-star

Star, unstar, or check if you starred a repository or the repositories associated with NPM and Bower package file dependencies on GitHub

## CLI

#### Installation

```
npm i -g github-star
```

#### Usage

githubstar [options]

- `--help` (`-h`): Output usage information
- `--version` (`-V`): Output the version number
- `--repostar` (`-s`): Star a GitHub repository. `--author` (`-a`) and `--repo` (`-r`) must also be supplied.
- `--repounstar` (`-u`): Unstar a GitHub repository. `--author` (`-a`) and `--repo` (`-r`) must also be supplied.
- `--repoisstarred` (`-i`): Check if a GitHub repository is starred. `--author` (`-a`) and `--repo` (`-r`) must also be supplied.
- `--depsstar` (`-S`): Star all of the dependencies in a NPM or Bower package file on GitHub. `--jsonpath` (`-j`) must also be supplied.
- `--depsunstar` (`-U`): Unstar all of the dependencies in a NPM or Bower package file on GitHub. `--jsonpath` (`-j`) must also be supplied.
- `--depsarestarred` (`-A`): Check if all of the dependencies in a NPM or Bower package file are starred on GitHub. `--jsonpath` (`-j`) must also be supplied.
- `--username` (`-n`): A GitHub username (may be ommitted if GITHUB_USERNAME environment variable is set)
- `--token` (`-t`) / `--password` (`-p`): A GitHub personal access token (recommended) or password belonging to `--username` (may be ommitted if GITHUB_TOKEN environment variable is set)
- `--author` (`-a`): A GitHub author
- `--repo` (`-r`): A repository belonging to `--author`
- `--jsonpath` (`-j`): A path to a NPM or Bower package file
- `--bower` (`-b`): If this option is supplied or the file name in `--jsonpath` is "bower.json", it will be treated as a Bower package file, otherwise it will be treated as a NPM package file
- `--skipself` (`-z`): Skip repos belonging to `--username` when starring / unstarring dependencies
- `--skipauthor` (`-x`): An author to skip when starring / unstarring dependencies (repeatable)
- `--skiprepo` (`-X`): A repo to skip when starring / unstarring dependencies (repeatable)

## API

`gitHubStar.repository` methods are supported in RequireJS, CommonJS, and global environments. `gitHubStar.dependencies` methods are only supported in CommonJS environments.

#### GitHubStar(```username```, ```tokenOrPassword```)

Instantiate github-star

* string [`username`] - A GitHub username (may be ommitted if GITHUB_USERNAME environment variable is set)
* string [`tokenOrPassword`] - A GitHub personal access token (recommended) or password belonging to `username` (may be ommitted if GITHUB_TOKEN environment variable is set)

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

Star all of the dependencies in a NPM or Bower package file on GitHub.

* object `opt` - An options object
    * string `jsonPath` - A path to a NPM or Bower package file
    * boolean [`isBower`] - If true or the file name in `jsonPath` is "bower.json", it will be treated as a bower package file, otherwise it will be treated as a npm package file
    * boolean [`skipSelf`] - Skip repos belonging to `username` if true
    * array{string} [`skippedAuthors`] - Authors to skip
    * array{string} [`skippedRepos`] - Repos to skip
* function(array{object} `errors`, object{boolean} `wereStarred`) `cb` - A function to be executed after the dependencies are starred

__Example__

```
gitHubStar.dependencies.star({
    jsonPath: './some_file.json',
    isBower: true,
    skipSelf: true,
    skippedAuthors: ['isaacs', 'othiym23'],
    skippedRepos: ['lodash', 'underscore']
}, function(errors, wereStarred){
    _.each(errors, function(err) {
        console.error(err);
    });

    _.each(wereStarred, function(wasStarred, dependency) {
        console.log(dependency + ' was ' + (wasStarred ? '' : 'not ') + 'starred');
    });
});
```

#### gitHubStar.dependencies.unstar(```opt```, ```cb```)

Unstar all of the dependencies in a NPM or Bower package file on GitHub.

* object `opt` - An options object
    * string `jsonPath` - A path to a NPM or Bower package file
    * boolean [`isBower`] - If true or the file name in `jsonPath` is "bower.json", it will be treated as a bower package file, otherwise it will be treated as a npm package file
    * boolean [`skipSelf`] - Skip repos belonging to `username` if true
    * array{string} [`skippedAuthors`] - Authors to skip
    * array{string} [`skippedRepos`] - Repos to skip
* function(array{object} `errors`, object{boolean} `wereUnstarred`) `cb` - A function to be executed after the dependencies are unstarred

__Example__

```
gitHubStar.dependencies.unstar({
    jsonPath: './some_file.json',
    isBower: true,
    skipSelf: true,
    skippedAuthors: ['isaacs', 'othiym23'],
    skippedRepos: ['lodash', 'underscore']
}, function(errors, wereUnstarred){
    _.each(errors, function(err) {
        console.error(err);
    });

    _.each(wereUnstarred, function(wasUnstarred, dependency) {
        console.log(dependency + ' was ' + (wasUnstarred ? '' : 'not ') + 'unstarred');
    });
});
```

#### gitHubStar.dependencies.areStarred(```opt```, ```cb```)

Check if the dependencies in a NPM or Bower package file are starred on GitHub.

* object `opt` - An options object
    * string `jsonPath` - A path to a NPM or Bower package file
    * boolean [`isBower`] - If true or the file name in `jsonPath` is "bower.json", it will be treated as a bower package file, otherwise it will be treated as a npm package file
    * boolean [`skipSelf`] - Skip repos belonging to `username` if true
    * array{string} [`skippedAuthors`] - Authors to skip
    * array{string} [`skippedRepos`] - Repos to skip
* function(array{object} `errors`, object{boolean} `areStarred`) `cb` - A function to be executed after the dependencies are checked

__Example__

```
gitHubStar.dependencies.areStarred({
    jsonPath: './some_file.json',
    isBower: true,
    skipSelf: true,
    skippedAuthors: ['isaacs', 'othiym23'],
    skippedRepos: ['lodash', 'underscore']
}, function(errors, areStarred){
    _.each(errors, function(err) {
        console.error(err);
    });

    _.each(areStarred, function(isStarred, dependency) {
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