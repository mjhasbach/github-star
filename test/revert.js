"use strict";

let _ = require('lodash'),
    async = require('async'),
    shared = require('./shared');

let revert = module.exports = {
    analyze() {
        return new Promise((resolve, reject) => {
            revert.getPkgMgrDepStarStatus().then((starStatus) => {
                revert.prevStarStatus = starStatus;
                resolve();
            }).catch(reject);
        });
    },
    getPkgMgrDepStarStatus() {
        let pkgMgrStatus = {};

        return new Promise((resolve, reject) => {
            async.forEachOf(shared.pkgFiles, (path, pkgMgr, done) => {
                gitHubStar.dependencies.areStarred({depsPath: path, type: pkgMgr}, (err, areStarred) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    pkgMgrStatus[pkgMgr] = areStarred;
                    done();
                });
            }, (err) => {
                err ? reject(err) : resolve(pkgMgrStatus);
            });
        });
    },
    undo: () => {
        return new Promise((resolve, reject) => {
            revert.getPkgMgrDepStarStatus().then((starStatus) => {
                let diff = {};

                _.each(starStatus, (deps, pkgMgr) => {
                    diff[pkgMgr] = {star: [], unstar: []};

                    _.each(deps, (isStarred, dep) => {
                        if (isStarred !== revert.prevStarStatus[pkgMgr][dep]) {
                            diff[pkgMgr][isStarred ? 'unstar' : 'star'].push(dep);
                        }
                    });
                });

                async.forEachOf(diff, (methods, pkgMgr, cb) => {
                    async.forEachOf(methods, (deps, method, done) => {
                        if (!deps.length) {
                            done();
                            return;
                        }

                        gitHubStar.dependencies[method]({depsList: deps, type: pkgMgr}, (err) => {
                            if (err) {
                                done(err);
                                return;
                            }

                            let multiple = deps.length > 1,
                                verb = method === 'star' ? 'unstarred' : 'starred';

                            console.log(
                                `The following ${pkgMgr} ${multiple ? 'packages were' : 'package was'} ${verb} ` +
                                `during testing: ${deps.join(', ')}. The change${multiple ? 's have' : ' has'} ` +
                                'been reverted.'
                            );

                            done();
                        });
                    }, cb);
                }, (err) => {
                    err ? reject(err) : resolve();
                });
            }).catch(reject);
        });
    }
};