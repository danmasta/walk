describe('each', () => {

    it('should run callback for each file async', () => {

        let count = 0;

        return walk.each('./tests', file => {
            count++;
            return file;
        }).then(res => {
            expect(count).to.equal(res.length);
        });

    });

    it('should run callback for each file sync', () => {

        let count = 0;

        let res = walk.each.sync('./tests', file => {
            count ++;
            return file;
        });

        expect(count).to.equal(res.length);

    });

    it('should disable reading of files', () => {

        walk.each.sync('./tests', { read: false }, file => {
            expect(file.contents).to.equal(null);
        });

    });

});
