describe('walk', () => {

    it('should return a stream', () => {

        expect(walk('./index')).to.be.instanceOf(stream.Readable);

    });

    it('should return a promise', () => {

        expect(walk('./index').promise()).to.be.instanceOf(Promise);

    });

    it('should walk async', () => {

        return walk('./index').promise().then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
        });

    });

    it('should walk sync', () => {

        let res = walk('./index').sync();

        expect(res).to.exist;
        expect(res).to.be.an('array');

    });

    it('should support single file lookups', () => {

        let res = walk('./index.js').sync();

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should support require style lookups', () => {

        let res = walk('./index').sync();

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should include dot files', () => {

        let res = walk('./.gitignore', { dot: true }).sync();

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should exclude dot files', () => {

        let res = walk('./.gitignore', { dot: false }).sync();

        expect(res).to.be.empty;
        expect(res).to.be.an('array');

    });

    it('should support glob filtering', () => {

        let res = walk('./', { src: '**/*.md' }).sync();

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should ignore excluded directories', () => {

        return walk('./', { src: 'tests/**/*', ignore: 'tests|.git|node_modules' }).promise().then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
            expect(res.length).to.equal(0);
        });

    });

});
