describe('Iterate', () => {

    it('map', async () => {
        let count = 0;
        let res = sync('tests').map(file => {
            count++;
            return null;
        });
        expect(count).to.equal(5);
        expect(res).to.be.an('array');
        expect(res.length).to.equal(5);
        expect(res.at(0)).to.be.null;
        await walk('tests').map(async file => {
            count++;
            return null;
        }).then(res => {
            expect(count).to.equal(10);
            expect(res).to.be.an('array');
            expect(res.length).to.equal(5);
            expect(res.at(0)).to.be.null;
        });
    });

    it('tap', async () => {
        let count = 0;
        let res = walk('tests').tap(file => {
            count++;
            return null;
        });
        expect(count).to.equal(5);
        expect(res).to.be.an('array');
        expect(res.length).to.equal(5);
        expect(res.at(0)).to.be.instanceOf(File);
        await walk('tests').tap(async file => {
            count++;
            return null;
        }).then(res => {
            expect(count).to.equal(10);
            expect(res).to.be.an('array');
            expect(res.length).to.equal(5);
            expect(res.at(0)).to.be.instanceOf(File);
        });
    });

    it('each', async () => {
        let count = 0;
        let res = walk('tests').each(file => {
            count++;
            return file;
        });
        expect(count).to.equal(5);
        expect(res).to.be.instanceOf(Walk);
        await walk('tests').each(async file => {
            count++;
            return file;
        }).then(res => {
            expect(count).to.equal(10);
            expect(res).to.be.instanceOf(Walk);
        });
    });

    it('synchronous array', () => {
        let res = sync('tests');
        expect(res).to.be.an('array');
        expect(res.length).to.equal(5);
        expect(res.map).to.be.a('function');
        expect(res.forEach).to.be.a('function');
    });

    it('iterable', () => {
        let count = 0;
        for (let file of walk('tests')) {
            count++
            expect(file).to.be.instanceOf(File);
        }
        expect(count).to.equal(5);
    });

    it('async iterable', async () => {
        let count = 0;
        for await (let file of walk('tests')) {
            count++
            expect(file).to.be.instanceOf(File);
        }
        expect(count).to.equal(5);
    });

    it('generator', () => {
        let count = 0;
        let gen = walk('tests').generatorSync();
        expect(gen).to.be.a('Generator');
        for (let file of gen) {
            count++
            expect(file).to.be.instanceOf(File);
        }
        expect(count).to.equal(5);
    });

    it('async generator', async () => {
        let count = 0;
        let gen = walk('tests').generator();
        expect(gen).to.be.a('AsyncGenerator');
        for await (let file of gen) {
            count++
            expect(file).to.be.instanceOf(File);
        }
        expect(count).to.equal(5);
    });

});
