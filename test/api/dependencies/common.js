"use strict";

let _ = require('lodash'),
    uuid = require('uuid'),
    shared = require('../../shared');

let fakePkgs = [uuid.v4(), uuid.v4()],
    countDeps = (opt) => {
        return opt.type === 'Atmosphere' ? shared.getAtmosphereDeps(opt.path).length : shared.getNPMBowerDeps(opt).length;
    };

module.exports = (type) => {
    it('should throw an error if cb is not a function', (done) => {
        (() => {
            gitHubStar.dependencies[type]({depsPath: shared.pkgFiles.NPM});
        }).should.throw();

        done();
    });
    it('should call back an error if opt is not an object', (done) => {
        gitHubStar.dependencies[type](null, (err) => {
            should.exist(err);
            err.should.be.an('error');
            done();
        });
    });
    it(
        'should call back an error if non-Atmosphere deps are supplied for opt.depsList and opt.type is not supplied',
        (done) => {
            gitHubStar.dependencies[type]({depsList: [shared.npmBowerPkg]}, (err) => {
                should.exist(err);
                err.should.be.an('error');
                done();
            });
        }
    );
    it(
        'should complete successfully if non-Atmosphere deps are supplied for opt.depsList and opt.type is supplied',
        (done) => {
            gitHubStar.dependencies[type]({depsList: [shared.npmBowerPkg], type: 'npm'}, (err, results) => {
                should.not.exist(err);
                results.should.be.an('object');
                results[shared.npmBowerPkg].should.be.a('boolean');
                done();
            });
        }
    );
    it(
        'should complete successfully if Atmosphere deps are supplied for opt.depsList and opt.type is not supplied',
        (done) => {
            gitHubStar.dependencies[type]({depsList: [shared.atmospherePkg]}, (err, results) => {
                should.not.exist(err);
                results.should.be.an('object');
                results[shared.atmospherePkg].should.be.a('boolean');
                done();
            });
        }
    );
    it('should call back an error if neither opt.depsList nor opt.depsPath are supplied', (done) => {
        gitHubStar.dependencies[type]({}, (err) => {
            should.exist(err);
            err.should.be.an('error');
            done();
        });
    });
    it(
        'should call back an error if opt.depsPath is supplied and ' +
        'opt.dependencies and opt.devDependencies are both false',
        (done) => {
            gitHubStar.dependencies[type](
                {
                    depsPath: shared.pkgFiles.NPM,
                    dependencies: false,
                    devDependencies: false
                },
                (err) => {
                    should.exist(err);
                    err.should.be.an('error');
                    done();
                }
            );
        }
    );
    it('should complete successfully if opt.depsPath is supplied and opt.dependencies is false', (done) => {
        let pkgFile = shared.pkgFiles.NPM;

        gitHubStar.dependencies[type](
            {
                depsPath: pkgFile,
                dependencies: false
            },
            (err, results) => {
                should.not.exist(err);
                results.should.be.an('object');

                countDeps({path: pkgFile, devDependencies: true}).should.equal(Object.keys(results).length);

                _.each(results, (result) => {
                    result.should.be.a('boolean');
                });

                done();
            }
        );
    });
    it('should complete successfully if opt.depsPath is supplied and opt.devDependencies is false', (done) => {
        let pkgFile = shared.pkgFiles.NPM;

        gitHubStar.dependencies[type](
            {
                depsPath: pkgFile,
                devDependencies: false
            },
            (err, results) => {
                should.not.exist(err);
                results.should.be.an('object');

                countDeps({path: pkgFile, dependencies: true}).should.equal(Object.keys(results).length);

                _.each(results, (result) => {
                    result.should.be.a('boolean');
                });

                done();
            }
        );
    });
    for (let pkgManager of Object.keys(shared.pkgFiles)) {
        let realPkg = pkgManager === 'Atmosphere' ? shared.atmospherePkg : shared.npmBowerPkg,
            mixedPkgs = [realPkg, ...fakePkgs];

        it(
            'should call back a results object containing booleans and errors when both valid and invalid ' +
            `${pkgManager} packages are submitted`,
            (done) => {
                gitHubStar.dependencies[type](
                    {
                        depsList: mixedPkgs,
                        type: pkgManager
                    },
                    (err, results) => {
                        should.not.exist(err);
                        results.should.be.an('object');
                        results.should.have.all.keys(mixedPkgs);

                        _.each(results, (result, name) => {
                            name === realPkg ? result.should.be.a('boolean') : result.should.be.an('error');
                        });

                        done();
                    }
                );
            }
        );
        it(`should complete successfully when supplying ${pkgManager} package files`, (done) => {
            let pkgFile = shared.pkgFiles[pkgManager];

            gitHubStar.dependencies[type](
                {
                    depsPath: pkgFile,
                    type: pkgManager
                },
                (err, results) => {
                    should.not.exist(err);
                    results.should.be.an('object');

                    countDeps({type: pkgManager, path: pkgFile, dependencies: true, devDependencies: true})
                        .should.equal(Object.keys(results).length);

                    _.each(results, (result) => {
                        result.should.be.a('boolean');
                    });

                    done();
                }
            );
        });
    }
};