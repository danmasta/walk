describe('stream', () => {

    it('should return a stream', () => {

        expect(util.isStream(walk.stream('./tests'))).to.be.true;

    });

    it('should read contents as a stream', () => {

        let res = walk.sync('./tests', { stream: true });

        expect(util.isStream(res[0].contents)).to.be.true;

    });

});
