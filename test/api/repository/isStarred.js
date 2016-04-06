describe('github-star API: gitHubStar.repository.isStarred', function() {
    require('./common')('isStarred').all();

    it('should check if a repo is starred', function(done) {
        gitHubStar.repository.isStarred('mochajs', 'mocha', function(err, isStarred) {
            should.not.exist(err);
            isStarred.should.be.a('boolean');
            done();
        });
    });
});