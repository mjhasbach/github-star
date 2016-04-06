"use strict";

let shared = require('../../shared');

module.exports = (type) => {
    let pkgData = shared.atmospherePkg.split(':'),
        author = pkgData[0],
        repo = pkgData[1];

    return {
        starUnstar() {
            this.all();

            it('should call back an error when a non-existent repo is supplied', (done) => {
                gitHubStar.repository[type]('mjhasbach', 'bacon-please', (err) => {
                    should.exist(err);
                    done();
                });
            });

            it(`should ${type} a repo`, (done) => {
                gitHubStar.repository[type](author, repo, (err) => {
                    should.not.exist(err);
                    done();
                });
            });
        },
        all() {
            it('should throw an error if cb is not a function', (done) => {
                (() => {gitHubStar.repository[type](author, repo);}).should.throw();
                done();
            });
            it('should call back an error if author is not a string', (done) => {
                gitHubStar.repository[type](null, repo, (err) => {
                    should.exist(err);
                    done();
                });
            });
            it('should call back an error if repo is not a string', (done) => {
                gitHubStar.repository[type](author, null, (err) => {
                    should.exist(err);
                    done();
                });
            });
        }
    }
};