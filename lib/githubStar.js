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
            require('package-json')
        );
    } else {
        root.githubStar = factory(root._, root.superagent);
    }
}(this, function(_, http, async, githubUrlToObject, bowerPackageURL, atmospherePackageInfo, packageJSONInfo) {
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
                return _.contains(['star', 'unstar', 'isStarred'], method) ? null :
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
                    .end(function(error, res) {
                        if (_.isObject(error)) {
                            var prefix = 'repo "' + authorRepo;

                            error = new Error(
                                res.statusCode === 404 ? prefix + '" not found on GitHub' :
                                prefix + ': ' + error.status + ' ' + error.message
                            );
                        }

                        cb(error, method === 'isStarred' ? res.statusCode === 204 : undefined);
                    });
            },
            dependencies = {
                process: function(method, opt, cb) {
                    var methodErr = validateMethod(method);

                    if (!_.isFunction(cb)) {
                        throw new TypeError('cb must be a function');
                    }
                    if (!_.isObject(opt)) {
                        cb([new TypeError('opt must be an object')], {});
                        return;
                    }
                    if (!_.isString(opt.depsPath)) {
                        cb([new TypeError('opt.depsPath must be a string')], {});
                        return;
                    }
                    if (methodErr) {
                        cb([methodErr], {});
                        return;
                    }
                    if (!isNode) {
                        cb([new Error('dependencies methods are only supported in CommonJS environments')], {});
                        return;
                    }

                    if (!_.isBoolean(opt.dependencies)) {
                        opt.dependencies = true;
                    }
                    if (!_.isBoolean(opt.devDependencies)) {
                        opt.devDependencies = true;
                    }

                    if (!opt.dependencies && !opt.devDependencies) {
                        cb([new Error('opt.dependencies and opt.devDependencies cannot both be false')], {});
                        return;
                    }

                    fs.readFile(opt.depsPath, function(err, data) {
                        if (err) {
                            cb([err], {});
                            return;
                        }

                        try {
                            var packageJSON = JSON.parse(data);
                        }
                        catch (e) {
                            var meteorDeps = _.reduce(data.toString().split('\n'), function(result, line) {
                                if (line.length > 1 && line[0] !== '#') {
                                    result.push(line.trim());
                                }

                                return result;
                            }, []);

                            if (!meteorDeps.length) {
                                cb([new SyntaxError('unable to parse NPM / Bower / Meteor dependencies')], {});
                                return;
                            }
                        }

                        var errors = [],
                            results = {},
                            packageManager = opt.isBower || path.parse(opt.depsPath).base === 'bower.json' ?
                                'Bower' : 'NPM',
                            callRepositoryMethod = _.partial(
                                dependencies.callRepositoryMethod, opt, method, errors, results, packageManager
                            );

                        if (_.get(meteorDeps, 'length')) {
                            atmospherePackageInfo(meteorDeps, function(err, packages) {
                                if (err) {
                                    cb(err, {});
                                    return;
                                }

                                async.forEach(packages, function(pkg, done) {
                                    var repo = pkg.latestVersion.git;

                                    if (repo) {
                                        callRepositoryMethod(null, pkg.name, repo, done);
                                    }
                                    else {
                                        results[pkg.name] = false;
                                        done();
                                    }
                                },function() {
                                    cb(errors, results);
                                });
                            });

                            return;
                        }

                        async.forEachOf(
                            _.chain(packageJSON)
                                .filter(function(val, key) {
                                    return (opt.dependencies && key === 'dependencies') ||
                                        (opt.devDependencies && key === 'devDependencies');
                                })
                                .reduce(function(result, val) {
                                    return _.merge(result, val);
                                }, {})
                                .value(),
                            function(version, name, done) {
                                if (githubUrlToObject(version)) {
                                    callRepositoryMethod(null, name, version, done);
                                }
                                else if (packageManager === 'Bower') {
                                    bowerPackageURL(name, function(err, url) {
                                        callRepositoryMethod(err, name, url, done);
                                    });
                                }
                                else {
                                    packageJSONInfo(name, 'latest', function(err, info) {
                                        callRepositoryMethod(err, name, err ? null : info.repository.url, done);
                                    });
                                }
                            },
                            function() {
                                cb(errors, results);
                            }
                        );
                    });
                },
                callRepositoryMethod: function(opt, method, errors, results, packageManager, pkgErr, name, url, done) {
                    var ghObject = githubUrlToObject(url);

                    if (pkgErr || !ghObject) {
                        var err =
                            _.isObject(pkgErr) &&
                            (_.contains(pkgErr.message, 'doesn\'t exist') || pkgErr.status === 404) ?
                                new Error('package "' + name + '" not found on ' + packageManager) :
                                !ghObject ? new Error(url + ' is not a GitHub repository') : pkgErr;

                        errors.push(err);
                        results[name] = false;
                        done();
                        return;
                    }

                    var author = ghObject.user,
                        repo = ghObject.repo;

                    if ((opt.skipSelf && username === author) ||
                        _.contains(opt.skippedAuthors, author) ||
                        _.contains(opt.skippedRepos, repo)) {

                        done();
                        return;
                    }

                    api.repository[method](author, repo, function(err, isStarred) {
                        err ? errors.push(err) : null;
                        results[name] = method === 'isStarred' ? isStarred : !err;
                        done();
                    });
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
                        dependencies.process('star', opt, cb);
                    },
                    unstar: function(opt, cb) {
                        dependencies.process('unstar', opt, cb);
                    },
                    areStarred: function(opt, cb) {
                        dependencies.process('isStarred', opt, cb);
                    }
                }
            };

        return api;
    };
}));