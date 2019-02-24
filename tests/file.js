describe('file', () => {

    it('should have correct properties', () => {

        return walk('./index').map(file => {

            expect(file.cwd).to.exist;
            expect(file.root).to.exist;
            expect(file.path).to.exist;
            expect(file.relative).to.exist;
            expect(file.relativeFromCwd).to.exist;
            expect(file.dir).to.exist;
            expect(file.base).to.exist;
            expect(file.name).to.exist;
            expect(file.ext).to.exist;
            expect(file.stat).to.exist;
            expect(file.contents).to.equal(null);

        });

    });

    it('should have helper methods', () => {

        return walk('./index').map(file => {

            expect(file.isBuffer).to.be.a('function');
            expect(file.isStream).to.be.a('function');
            expect(file.isNull).to.be.a('function');
            expect(file.isString).to.be.a('function');
            expect(file.isDirectory).to.be.a('function');
            expect(file.isSymbolic).to.be.a('function');

        });

    });

    it('should have contents', () => {

        return walk.contents('./index').map(file => {

            expect(file.contents).to.exist;

        });

    });

});
