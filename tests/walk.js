describe('walk', function () {

    it('should walk async', function (done) {

        walk.walk({ root: './tests' }).then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
            done();
        });

    });

    it('should walk sync', function () {

        let res = walk.walkSync({ root: './tests' });

        expect(res).to.exist;
        expect(res).to.be.an('array');

    });

    it('should support single file lookups', function () {

        let res = walk.walkSync({ root: './index.js' });

        expect(res).to.exist;
        expect(res).to.be.an('array');

    });

    it('should support require style lookups', function () {

        let res = walk.walkSync({ root: './index' });

        expect(res).to.exist;
        expect(res).to.be.an('array');

    });

    it('should support dot files', function () {

        let res = walk.walkSync({ root: './.gitignore', dot: true });

        expect(res).to.exist;
        expect(res).to.be.an('array');

    });

    it('should ignore dot files', function () {

        let res = walk.walkSync({ root: './.gitignore', dot: false });

        expect(res).to.be.empty;
        expect(res).to.be.an('array');

    });

    it('should support glob filtering', function () {

        let res = walk.walkSync({ root: './', src: '**/*.md' });

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should ignore excluded directories', function (done) {

        walk.walk({ root: './', src: 'tests/**/*', exclude: ['tests', '.git', 'node_modules'] }).then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
            expect(res.length).to.equal(0);
            done();
        });

    });

    it('should not ignore directories', function () {

        let res = walk.walkSync({ root: './tests' });

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.be.above(0);

    });

});
