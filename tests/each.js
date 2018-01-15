describe('each', function () {

    it('should run callback for each file async', function (done) {

        let count = 0;

        walk.each({ root: './tests' }, file => {
            count++;
            return file;
        }).then(res => {
            expect(count).to.equal(res.length);
            done();
        });

    });

    it('should run callback for each file sync', function () {

        let count = 0;

        let res = walk.eachSync({ root: './tests' }, file => {
            count ++;
            return file;
        });

        expect(count).to.equal(res.length);

    });

    it('should disable reading of files', function () {

        walk.eachSync({ root: './tests', read: false }, file => {
            expect(file.contents).to.equal(null);
        });

    });

});
