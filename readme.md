# github-star

Star, unstar, or check if you starred a repository or all of your NPM / Bower / etc. dependencies on GitHub

## CLI

Note: `--username` (`-n`) and (`--password` (`-p`) or `--token` (`-t`)) must always be supplied.

`--repostar` (`-s`): Star a GitHub repository. `--author` (`-a`) and `--repo` (`-r`) must also be supplied.
`--repounstar` (`-u`): Unstar a GitHub repository. `--author` (`-a`) and `--repo` (`-r`) must also be supplied.
`--repoisstarred` (`-i`): Check if a GitHub repository is starred. `--author` (`-a`) and `--repo` (`-r`) must also be supplied.
`--depsstar` (`-S`): Star all of the dependencies in a package.json, bower.json, or similar file on GitHub. `--jsonpath` (`-j`) must also be supplied.
`--depsunstar` (`-U`): Unstar all of the dependencies in a package.json, bower.json, or similar file on GitHub. `--jsonpath` (`-j`) must also be supplied.
`--depsarestarred` (`-A`): Check if all of the dependencies in a package.json, bower.json, or similar file are starred on GitHub. `--jsonpath` (`-j`) must also be supplied.
`--username` (`-n`): A GitHub username
`--token` (`-t`): A GitHub personal access token or password belonging to `--username`
`--password` (`-p`): A GitHub password or personal access token belonging to `--username`
`--author` (`-a`): A GitHub author
`--repo` (`-r`): A repository belonging to `--author`
`--jsonpath` (`-j`): A path to a package.json, bower.json, or similar file

## API

`gitHubStar.repository` methods are supported in RequireJS, CommonJS, and global environments. `gitHubStar.dependencies` methods are only supported in CommonJS environments.

#### GitHubStar(```username```, ```tokenOrPassword```)

Instantiate github-star

* string `username` - A GitHub username
* string `tokenOrPassword` - A GitHub personal access token (recommended) or password

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

#### gitHubStar.dependencies.star(```jsonPath```, ```cb```)

Star all of the dependencies in a `package.json`, `bower.json`, or similar file on GitHub. Any JSON file with `dependencies` or `devDependencies` keys are supported. Note that dependencies for non-`package.json` files are only recognized if their names correspond with NPM package names.

* string `jsonPath` - A path to a `package.json`, `bower.json`, or similar file
* function(null | object `err`) `cb` - A function to be executed after the dependencies are starred

__Example__

```
gitHubStar.dependencies.star('./package.json', function(err){
    if (err) { console.error(err); }
});
```

#### gitHubStar.dependencies.unstar(```jsonPath```, ```cb```)

Unstar all of the dependencies in a `package.json`, `bower.json`, or similar file on GitHub. Any JSON file with `dependencies` or `devDependencies` keys are supported. Note that dependencies for non-`package.json` files are only recognized if their names correspond with NPM package names.

* string `jsonPath` - A path to a `package.json`, `bower.json`, or similar file
* function(null | object `err`) `cb` - A function to be executed after the dependencies are unstarred

__Example__

```
gitHubStar.dependencies.unstar('./package.json', function(err){
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