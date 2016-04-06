(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash', 'superagent'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('lodash'),
            require('superagent'),
            require('async'),
            require('github-url-to-object'),
            require('bower-package-url'),
            require('atmosphere-package-info'),
            require('package-json'),
            require('pascal-case')
        );
    } else {
        root.githubStar = factory(root._, root.superagent);
    }
}(this, function(_, http, async, ghUrlToObject, bowerPackageURL, atmospherePackageInfo, packageJSONInfo, pascalCase) {
    var isNode = _.isObject(async);

    if (isNode) {
        var fs = require('fs'),
            url = require('url'),
            path = require('path');
    }

    return function(username, tokenOrPassword) {
        if (!_.isString(username)) {
            if (isNode && _.isString(process.env.GITHUB_USERNAME)) {
                username = process.env.GITHUB_USERNAME;
            }
            else {
                throw new TypeError('username argument or GITHUB_USERNAME environment variable must be a string');
            }
        }
        if (!_.isString(tokenOrPassword)) {
            if (isNode && _.isString(process.env.GITHUB_TOKEN)) {
                tokenOrPassword = process.env.GITHUB_TOKEN;
            }
            else {
                throw new TypeError('tokenOrPassword argument or GITHUB_TOKEN environment variable must be a string');
            }
        }

        var validateMethod = function(method) {
                return _.includes(['star', 'unstar', 'isStarred'], method) ? null :
                    new TypeError('method must be "star", "unstar", or "isStarred"');
            },
            repository = function(method, author, repo, cb) {
                var methodErr = validateMethod(method);

                if (!_.isFunction(cb)) {
                    throw new TypeError('cb must be a function');
                }
                if (!_.isString(author)) {
                    cb(new TypeError('author must be a string'));
                    return;
                }
                if (!_.isString(repo)) {
                    cb(new TypeError('repo must be a string'));
                    return;
                }
                if (methodErr) {
                    cb(methodErr);
                    return;
                }

                var authorRepo = author + '/' + repo;

                http[method === 'star' ? 'put' : method === 'unstar' ? 'del' : 'get']
                ('https://api.github.com/user/starred/' + authorRepo)
                    .set('Content-Length', 0)
                    .auth(username, tokenOrPassword)
                    .end(function(err, res) {
                        var isChecking = method === 'isStarred';

                        if (_.isObject(err)) {
                            var is404 = res.statusCode === 404,
                                prefix = 'Repo "' + authorRepo;

                            err = isChecking && is404 ? null :
                                new Error(
                                    is404 ? prefix + '" not found on GitHub' :
                                    prefix + ': ' + err.status + ' ' + err.message
                                );
                        }

                        cb(err, isChecking ? res.statusCode === 204 : undefined);
                    });
            },
            dependencies = {
                readAndParse: function(opt, cb) {
                    fs.readFile(opt.depsPath, function(err, data) {
                        if (err) {
                            cb(err);
                            return;
                        }

                        try {
                            opt.deps = _.chain(JSON.parse(data))
                                .filter(function(val, key) {
                                    return (opt.dependencies && key === 'dependencies') ||
                                        (opt.devDependencies && key === 'devDependencies');
                                })
                                .reduce(function(result, val) {
                                    return _.merge(result, val);
                                }, {})
                                .value();

                            opt.type = opt.type || (_.isString(opt.depsPath) &&
                            path.parse(opt.depsPath).base === 'bower.json') ? 'Bower' : 'NPM';
                        }
                        catch (e) {
                            opt.deps = _.reduce(data.toString().split('\n'), function(result, line) {
                                if (line.length > 1 && line[0] !== '#') {
                                    result.push(line.trim());
                                }

                                return result;
                            }, []);

                            opt.type = 'Atmosphere';

                            if (!opt.deps.length) {
                                err = new SyntaxError('Unable to parse NPM / Bower / Atmosphere dependencies');
                            }
                        }

                        cb(err);
                    });
                },
                callRepositoryMethod: function(opt, pkgErr, name, url, done) {
                    var ghObject = ghUrlToObject(url);

                    if (pkgErr || !ghObject) {
                        opt.results[name] = pkgErr ? pkgErr : !ghObject ?
                            new Error(url + ' is not a GitHub repository') : null;

                        done();
                        return;
                    }

                    var author = ghObject.user,
                        repo = ghObject.repo;

                    if ((opt.skipSelf && username === author) ||
                        _.includes(opt.skippedAuthors, author) ||
                        _.includes(opt.skippedRepos, repo)) {

                        done();
                        return;
                    }

                    api.repository[opt.method](author, repo, function(err, isStarred) {
                        opt.results[name] = err ? err : opt.method === 'isStarred' ? isStarred : !err;
                        done();
                    });
                },
                process: {
                    init: function(method, opt, cb) {
                        var methodErr = validateMethod(method);

                        if (!_.isFunction(cb)) {
                            throw new TypeError('cb must be a function');
                        }

                        if (methodErr) {
                            cb(methodErr, {});
                            return;
                        }

                        if (!isNode) {
                            cb(new Error('dependencies methods are only supported in CommonJS environments'), {});
                            return;
                        }

                        if (!_.isObject(opt)) {
                            cb(new TypeError('opt must be an object'), {});
                            return;
                        }

                        if (_.isArray(opt.depsList)) {
                            if (!_.isString(opt.type)) {
                                _.each(opt.depsList, function(dep) {
                                    if (_.isString(dep) && _.includes(dep, ':')) {
                                        opt.type = 'Atmosphere';
                                        return false;
                                    }
                                });

                                if (!_.isString(opt.type)) {
                                    cb(new Error('Unable to determine the package manager associated with ' +
                                        'opt.depsList. Please specify "NPM" or "Bower" (case-insensitive) for ' +
                                        'opt.type'), {});
                                    return;
                                }
                            }
                        }
                        else {
                            if (!_.isString(opt.depsPath)) {
                                cb(new TypeError('opt.depsPath must be a string path to a Atmosphere, NPM, or Bower ' +
                                    'package file, or opt.depsList must be an array of package names'), {});
                                return;
                            }
                            if (!_.isBoolean(opt.dependencies)) {
                                opt.dependencies = true;
                            }
                            if (!_.isBoolean(opt.devDependencies)) {
                                opt.devDependencies = true;
                            }
                            if (!opt.dependencies && !opt.devDependencies) {
                                cb(new Error('opt.dependencies and opt.devDependencies cannot both be false'), {});
                                return;
                            }
                        }

                        if (_.isString(opt.type)) {
                            var upperType = opt.type.toUpperCase();

                            opt.type = upperType === 'NPM' ? upperType : pascalCase(opt.type);
                        }

                        opt.results = {};
                        opt.method = method;

                        if (opt.depsPath) {
                            dependencies.readAndParse(opt, function(err) {
                                if (err) {
                                    cb(err, {});
                                    return;
                                }

                                dependencies.process.callPackageManagerMethod(opt, cb);
                            });
                        }
                        else {
                            opt.deps = opt.depsList;

                            dependencies.process.callPackageManagerMethod(opt, cb);
                        }
                    },
                    callPackageManagerMethod: function(opt, cb) {
                        opt.type === 'Atmosphere' ? dependencies.process.atmosphere(opt, cb) :
                            dependencies.process.npmOrBower(opt, cb);
                    },
                    npmOrBower: function(opt, cb) {
                        var repoMethod = _.partial(dependencies.callRepositoryMethod, opt);

                        async.forEachOf(
                            opt.deps,
                            function(versionOrURLOrName, name, done) {
                                if (opt.depsList) {
                                    name = versionOrURLOrName;
                                }

                                if (ghUrlToObject(versionOrURLOrName)) {
                                    repoMethod(null, name, versionOrURLOrName, done);
                                }
                                else if (opt.type === 'Bower') {
                                    bowerPackageURL(name, function(err, url) {
                                        repoMethod(err, name, url, done);
                                    });
                                }
                                else {
                                    packageJSONInfo(name, 'latest').then(function(info) {
                                        repoMethod(null, name, info.repository.url, done);
                                    }).catch(function(err) {
                                        repoMethod(err, name, null, done);
                                    });
                                }
                            },
                            function() {
                                cb(null, opt.results);
                            }
                        );
                    },
                    atmosphere: function(opt, cb) {
                        atmospherePackageInfo(opt.deps, function(err, packages) {
                            if (err) {
                                cb(err, {});
                                return;
                            }

                            async.forEachOf(packages, function(data, name, done) {
                                var err = data instanceof Error ? data : null,
                                    repo = _.get(data, 'latestVersion.git');

                                dependencies.callRepositoryMethod(opt, err, name, repo, done);
                            }, function() {
                                cb(null, opt.results);
                            });
                        });
                    }
                }
            },
            api = {
                repository: {
                    star: function(author, repo, cb) {
                        repository('star', author, repo, cb);
                    },
                    unstar: function(author, repo, cb) {
                        repository('unstar', author, repo, cb);
                    },
                    isStarred: function(author, repo, cb) {
                        repository('isStarred', author, repo, cb);
                    }
                },
                dependencies: {
                    star: function(opt, cb) {
                        dependencies.process.init('star', opt, cb);
                    },
                    unstar: function(opt, cb) {
                        dependencies.process.init('unstar', opt, cb);
                    },
                    areStarred: function(opt, cb) {
                        dependencies.process.init('isStarred', opt, cb);
                    }
                }
            };

        return api;
    };
}));