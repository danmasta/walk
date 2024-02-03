describe('Iterate', () => {

    it('should run a callback for each file and accumulate results', () => {

        let count = 0;

        return walk('./tests').map(file => {
            count++;
            return file;
        }).then(res => {
            expect(count).to.equal(4);
            expect(res.length).to.equal(4);
        });

    });

    it('should run a callback for each file and not accumulate results', () => {

        let count = 0;

        return walk('./tests').each(file => {
            count++;
            return file;
        }).then(res => {
            expect(count).to.equal(4);
            expect(res).to.equal(undefined);
        });

    });

    it('should be able to iterate over files as a synchronous array', () => {

        let res = sync('./tests');

        expect(res).to.be.an('array');
        expect(res.length).to.equal(4);
        expect(res.map).to.be.a('function');
        expect(res.forEach).to.be.a('function');

    });

});
