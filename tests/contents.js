describe('contents', function () {

    it('should get contents async', function (done) {

        walk.contents({ root: './tests' }).then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
            expect(res.length).to.be.above(1);
            expect(res[0].contents).to.exist;
            done();
        });

    });

    it('should get contents sync', function () {

        let res = walk.contentsSync({ root: './tests' });

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.be.above(1);
        expect(res[0].contents).to.exist;

    });

    it('should require files instead of reading them', function () {

        let res = walk.contentsSync({ root: './index', require: true });

        expect(res[0].contents).to.be.an('object');

    });

});
