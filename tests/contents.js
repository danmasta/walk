describe('contents', () => {

    it('should get contents async', () => {

        return walk.contents('./tests').then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
            expect(res.length).to.be.above(1);
            expect(res[0].contents).to.exist;
        });

    });

    it('should get contents sync', () => {

        let res = walk.contents.sync('./tests');

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.be.above(1);
        expect(res[0].contents).to.exist;

    });

    it('should require files instead of reading them', () => {

        let res = walk.contents.sync('./index', { require: true });

        expect(res[0].contents).to.be.a('function');

    });

});
