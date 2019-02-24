describe('walk', () => {

    it('should walk async', () => {

        return walk('./tests').then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
        });

    });

    it('should walk sync', () => {

        let res = walk.sync('./tests');

        expect(res).to.exist;
        expect(res).to.be.an('array');

    });

    it('should support single file lookups', () => {

        let res = walk.sync('./index.js');

        expect(res).to.exist;
        expect(res).to.be.an('array');

    });

    it('should support require style lookups', () => {

        let res = walk.sync('./index');

        expect(res).to.exist;
        expect(res).to.be.an('array');

    });

    it('should support dot files', () => {

        let res = walk.sync('./.gitignore', { dot: true });

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should ignore dot files', () => {

        let res = walk.sync('./.gitignore', { dot: false });

        expect(res).to.be.empty;
        expect(res).to.be.an('array');

    });

    it('should support glob filtering', () => {

        let res = walk.sync('./', { src: '**/*.md' });

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should ignore excluded directories', () => {

        return walk.walk('./', { src: 'tests/**/*', ignore: 'tests|.git|node_modules' }).then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
            expect(res.length).to.equal(0);
        });

    });

    it('should not ignore directories', () => {

        let res = walk.sync('./tests');

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.be.above(0);

    });

});
