# github-star

Star, unstar, or check if you starred a repository or all of your NPM / Bower / etc. dependencies on GitHub

## CLI

#### Installation

`npm i -g github-star`

#### Usage

githubstar [options]

- `--help` (`-h`): Output usage information
- `--version` (`-V`): Output the version number
- `--repostar` (`-s`): Star a GitHub repository. `--author` (`-a`) and `--repo` (`-r`) must also be supplied.
- `--repounstar` (`-u`): Unstar a GitHub repository. `--author` (`-a`) and `--repo` (`-r`) must also be supplied.
- `--repoisstarred` (`-i`): Check if a GitHub repository is starred. `--author` (`-a`) and `--repo` (`-r`) must also be supplied.
- `--depsstar` (`-S`): Star all of the dependencies in a package.json, bower.json, or similar file on GitHub. `--jsonpath` (`-j`) must also be supplied.
- `--depsunstar` (`-U`): Unstar all of the dependencies in a package.json, bower.json, or similar file on GitHub. `--jsonpath` (`-j`) must also be supplied.
- `--depsarestarred` (`-A`): Check if all of the dependencies in a package.json, bower.json, or similar file are starred on GitHub. `--jsonpath` (`-j`) must also be supplied.
- `--username` (`-n`): A GitHub username (may be ommitted if GITHUB_USERNAME environment variable is set)
- `--token` (`-t`): A GitHub personal access token or password belonging to --username (may be ommitted if GITHUB_TOKEN environment variable is set)
- `--password` (`-p`): A GitHub password or personal access token belonging to `--username`
- `--author` (`-a`): A GitHub author
- `--repo` (`-r`): A repository belonging to `--author`
- `--jsonpath` (`-j`): A path to a package.json, bower.json, or similar file
- `--skipself` (`-z`): Skip repos belonging to --username when starring / unstarring dependencies
- `--skipauthor` (`-x`): An author to skip when starring / unstarring dependencies (repeatable)
- `--skiprepo` (`-X`): A repo to skip when starring / unstarring dependencies (repeatable)

## API

`gitHubStar.repository` methods are supported in RequireJS, CommonJS, and global environments. `gitHubStar.dependencies` methods are only supported in CommonJS environments.

#### GitHubStar(```username```, ```tokenOrPassword```)

Instantiate github-star

* string `username` - A GitHub username (may be ommitted if GITHUB_USERNAME environment variable is set)
* string `tokenOrPassword` - A GitHub personal access token (recommended) or password belonging to `username` (may be ommitted if GITHUB_TOKEN environment variable is set)

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

Star all of the dependencies in a `package.json`, `bower.json`, or similar file on GitHub. Any JSON file with `dependencies` or `devDependencies` keys are supported. Note that dependencies for non-`package.json` files are only recognized if their names correspond with NPM package names.

* object `opt` - An options object
    * string `jsonPath` - A path to a `package.json`, `bower.json`, or similar file
    * boolean [`skipSelf`] - Skip repos belonging to `username` if true
    * array{string} [`skippedAuthors`] - Authors to skip
    * array{string} [`skippedRepos`] - Repos to skip
* function(null | object `err`) `cb` - A function to be executed after the dependencies are starred

__Example__

```
gitHubStar.dependencies.star({
    jsonPath: './package.json',
    skipSelf: true,
    skippedAuthors: ['mjhasbach'],
    skippedRepos: ['github-star']
}, function(err){
    if (err) { console.error(err); }
});
```

#### gitHubStar.dependencies.unstar(```opt```, ```cb```)

Unstar all of the dependencies in a `package.json`, `bower.json`, or similar file on GitHub. Any JSON file with `dependencies` or `devDependencies` keys are supported. Note that dependencies for non-`package.json` files are only recognized if their names correspond with NPM package names.

* object `opt` - An options object
    * string `jsonPath` - A path to a `package.json`, `bower.json`, or similar file
    * boolean [`skipSelf`] - Skip repos belonging to `username` if true
    * array{string} [`skippedAuthors`] - Authors to skip
    * array{string} [`skippedRepos`] - Repos to skip
* function(null | object `err`) `cb` - A function to be executed after the dependencies are unstarred

__Example__

```
gitHubStar.dependencies.star({
    jsonPath: './package.json',
    skipSelf: true,
    skippedAuthors: ['mjhasbach'],
    skippedRepos: ['github-star']
}, function(err){
    if (err) { console.error(err); }
});
```

#### gitHubStar.dependencies.areStarred(```jsonPath```, ```cb```)

Check if all of the dependencies in a `package.json`, `bower.json`, or similar file are starred on GitHub. Any JSON file with `dependencies` or `devDependencies` keys are supported. Note that dependencies for non-`package.json` files are only recognized if their names correspond with NPM package names.

* string `jsonPath` - A path to a `package.json`, `bower.json`, or similar file
* function(null | object `err`, object{boolean} `areStarred`) `cb` - A function to be executed after the dependencies are checked

__Example__

```
gitHubStar.dependencies.areStarred('./package.json', function(err, areStarred){
    if (err) { console.error(err); }

    console.log(areStarred);
});
```

# Installation
### Npm
```
npm install github-star --save
```
### Bower
```
bower install github-star --save
```