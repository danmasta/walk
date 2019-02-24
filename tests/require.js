describe('require', () => {

    it('should require async', () => {

        return walk.require('./lib').then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
            expect(res.length).to.be.above(1);
            expect(res[0].contents).to.exist;
        });

    });

    it('should require sync', () => {

        let res = walk.require.sync('./lib');

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.be.above(1);
        expect(res[0].contents).to.exist;

    });

    it('should not be a string', () => {

        let res = walk.require.sync('./index');

        expect(res[0].contents).to.be.a('function');

    });

});
