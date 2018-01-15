describe('file', function () {

    it('should have correct properties', function (done) {

        walk.walk({ root: './index' }).map(file => {

            expect(file.cwd).to.exist;
            expect(file.root).to.exist;
            expect(file.path).to.exist;
            expect(file.relative).to.exist;
            expect(file.dir).to.exist;
            expect(file.base).to.exist;
            expect(file.name).to.exist;
            expect(file.ext).to.exist;
            expect(file.stat).to.exist;
            expect(file.contents).to.equal(null);

        }).then(() => {

            done();

        });

    });

    it('should have helper methods', function (done) {

        walk.walk({ root: './index' }).map(file => {

            expect(file.isBuffer).to.be.a('function');
            expect(file.isStream).to.be.a('function');
            expect(file.isNull).to.be.a('function');
            expect(file.isDirectory).to.be.a('function');
            expect(file.isSymbolic).to.be.a('function');

        }).then(() => {

            done();

        });

    });

    it('should have contents', function (done) {

        walk.contents({ root: './index' }).map(file => {

            expect(file.contents).to.exist;

        }).then(() => {

            done();

        });

    });

});
