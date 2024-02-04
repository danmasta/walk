describe('Walk', () => {

    it('should return a stream', () => {

        expect(walk('./index')).to.be.instanceOf(stream.Readable);

    });

    it('should return a promise', () => {

        expect(walk('./index').promise()).to.be.instanceOf(Promise);
        expect(walk('./index').then()).to.be.instanceOf(Promise);
        expect(walk('./index').catch()).to.be.instanceOf(Promise);

    });

    it('should walk async', () => {

        return walk('./index').then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
        });

    });

    it('should walk sync', () => {

        let res = sync('./index');

        expect(res).to.exist;
        expect(res).to.be.an('array');

    });

    it('should support single file lookups', () => {

        let res = sync('./index.js');

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should support require style lookups', () => {

        let res = sync('./index');

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should include dot files', () => {

        let res = sync('./.gitignore', { dot: true });

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should exclude dot files', () => {

        let res = sync('./.gitignore', { dot: false });

        expect(res).to.be.empty;
        expect(res).to.be.an('array');

    });

    it('should support filtering for includes', () => {

        let res = sync('./tests', { src: '_setup.js' });

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should support filtering for excludes', () => {

        let res = sync('./tests', { ignore: '_setup.js' });

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(3);

    });

    it('should not exclude root walk path', () => {

        let res = sync('./tests/_setup.js', { ignore: '_setup.js' });

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);

    });

    it('should support both includes and excludes', () => {

        return walk('./tests', { src: '(_setup|walk).js', ignore: '_setup.js' }).then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
            expect(res.length).to.equal(1);
        });

    });

});
