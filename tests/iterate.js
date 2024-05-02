describe('Iterate', () => {

    it('should run a callback for each file and accumulate results', () => {

        let count = 0;

        let res = new Sync('./tests').map(file => {
            count++;
            return null;
        });

        expect(count).to.equal(5);
        expect(res).to.be.an('array');
        expect(res.length).to.equal(5);
        expect(res.at(0)).to.be.null;

        return walk('./tests').map(file => {
            count++;
            return null;
        }).then(res => {
            expect(count).to.equal(10);
            expect(res).to.be.an('array');
            expect(res.length).to.equal(5);
            expect(res.at(0)).to.be.null;
        });

    });

    it('should run a callback for each file and not accumulate results', () => {

        let count = 0;

        let res = new Sync('./tests').each(file => {
            count++;
            return file;
        });

        expect(count).to.equal(5);
        expect(res).to.be.undefined;

        return walk('./tests').each(file => {
            count++;
            return file;
        }).then(res => {
            expect(count).to.equal(10);
            expect(res).to.be.undefined;
        });

    });

    it('should run a callback for each file and accumulate original file objects', () => {

        let count = 0;

        let res = new Sync('./tests').tap(file => {
            count++;
            return null;
        });

        expect(count).to.equal(5);
        expect(res).to.be.an('array');
        expect(res.length).to.equal(5);
        expect(res.at(0)).to.be.instanceOf(File);

        return walk('./tests').tap(file => {
            count++;
            return null;
        }).then(res => {
            expect(count).to.equal(10);
            expect(res).to.be.an('array');
            expect(res.length).to.equal(5);
            expect(res.at(0)).to.be.instanceOf(File);
        });

    });

    it('should be able to iterate over files as a synchronous array', () => {

        let res = sync('./tests');

        expect(res).to.be.an('array');
        expect(res.length).to.equal(5);
        expect(res.map).to.be.a('function');
        expect(res.forEach).to.be.a('function');

    });

});
