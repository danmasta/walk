describe('contents', () => {

    it('should get contents async', () => {

        return walk('./tests').contents().promise().then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
            expect(res.length).to.be.above(1);
            expect(res[0].contents).to.exist;
        });

    });

    it('should get contents sync', () => {

        let res = walk('./tests').contents().sync();

        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.be.above(1);
        expect(res[0].contents).to.exist;

    });

    it('should get file contents by requiring them', () => {

        let res = walk('./index').require().sync();

        expect(res[0].contents).to.be.a('function');

    });

    it('should get file contents as buffer', () => {

        let res = walk('./index').buffer().sync();

        expect(res[0].contents).to.be.instanceOf(Buffer);

    });

    it('should get file contents as string', () => {

        let res = walk('./index').contents().sync();

        expect(res[0].contents).to.be.a('string');

    });

    it('should get file contents as stream', () => {

        let res = walk('./index').stream().sync();

        expect(res[0].contents).to.be.instanceOf(stream.Readable);

    });

    it('should disable reading of file contents', () => {

        let res = walk('./index', { read: false }).sync();

        expect(res[0].contents).to.equal(null);

    });

});
