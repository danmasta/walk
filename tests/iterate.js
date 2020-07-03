describe('iterate', () => {

    it('should run a callback for each file and accumulate results', () => {

        let count = 0;

        return walk('./tests').map(file => {
            count++;
            return file;
        }).then(res => {
            expect(count).to.equal(testsFileCount);
            expect(res.length).to.equal(testsFileCount);
        });

    });

    it('should run a callback for each file and not accumulate results', () => {

        let count = 0;

        return walk('./tests').each(file => {
            count++;
            return file;
        }).then(res => {
            expect(count).to.equal(testsFileCount);
            expect(res).to.equal(undefined);
        });

    });

    it('should be able to iterate over results synchronously as an array', () => {

        let res = walk('./tests').sync();

        expect(res).to.be.an('array');
        expect(res.map).to.be.a('function');
        expect(res.forEach).to.be.a('function');

    });

});
