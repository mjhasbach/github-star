(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash', 'superagent'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('lodash'), require('superagent'), require('async'), require('package-json'));
    } else {
        root.echoBest = factory(root._, root.superagent);
    }
}(this, function(_, http, async, packageInfo) {
    var isNode = _.isObject(async);

    if (isNode) {
        var fs = require('fs'),
            url = require('url');
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

                http[method === 'star' ? 'put' : method === 'unstar' ? 'del' : 'get']
                ('https://api.github.com/user/starred/' + author + '/' + repo)
                    .set('Content-Length', 0)
                    .auth(username, tokenOrPassword)
                    .end(function(error, res) {
                        cb(
                            _.isObject(error) && res.statusCode !== 404 ? new Error(error.message) : null,
                            method === 'isStarred' ? res.statusCode === 204 : undefined
                        );
                    });
            },
            dependencies = function(method, opt, cb) {
                var methodErr = validateMethod(method);

                if (!_.isFunction(cb)) {
                    throw new TypeError('cb must be a function');
                }
                if (!_.isObject(opt)) {
                    cb(new TypeError('opt must be an object'));
                    return;
                }
                if (!_.isString(opt.jsonPath)) {
                    cb(new TypeError('opt.jsonPath must be a string'));
                    return;
                }
                if (methodErr) {
                    cb(methodErr);
                    return;
                }

                if (isNode) {
                    fs.readFile(opt.jsonPath, function(err, data) {
                        var areStarred = {};

                        if (err) {
                            cb(err);
                            return;
                        }

                        try {
                            var packageJSON = JSON.parse(data);
                        }
                        catch (e) {
                            cb(new SyntaxError('unable to parse package.json to an object'));
                            return;
                        }

                        async.each(
                            _.chain(packageJSON)
                                .filter(function(val, key) {
                                    return _.contains(['dependencies', 'devDependencies'], key);
                                })
                                .map(function(val) {
                                    return _.keys(val);
                                })
                                .flatten()
                                .value(),
                            function(dependency, done) {
                                packageInfo(dependency, 'latest', function(err, info) {
                                    if (_.isObject(info) &&
                                        _.isObject(info.repository) &&
                                        _.isString(info.repository.url)) {

                                        var parsedURL = url.parse(info.repository.url);

                                        if (parsedURL.hostname === 'github.com') {
                                            var pathArr = parsedURL.pathname.split('/'),
                                                author = pathArr[1],
                                                repo = pathArr[2].replace('.git', '');

                                            if ((opt.skipSelf && username === author) ||
                                                _.contains(opt.skippedAuthors, author) ||
                                                _.contains(opt.skippedRepos, repo)) {

                                                done();
                                                return;
                                            }

                                            api.repository[method](author, repo, function(err, isStarred) {
                                                if (method === 'isStarred') {
                                                    areStarred[author + '/' + repo] = isStarred;
                                                }

                                                done(err);
                                            });

                                            return;
                                        }
                                    }

                                    done(err);
                                });
                            },
                            function(err) {
                                cb(err, method === 'isStarred' ? areStarred : undefined);
                            }
                        );
                    });
                }
                else {
                    cb(new Error('githubStar.dependencies methods are only supported in CommonJS environments'));
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
                        dependencies('star', opt, cb);
                    },
                    unstar: function(opt, cb) {
                        dependencies('unstar', opt, cb);
                    },
                    areStarred: function(opt, cb) {
                        dependencies('isStarred', opt, cb);
                    }
                }
            };

        return api;
    };
}));