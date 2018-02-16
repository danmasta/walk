describe('options', function () {

    it('should support string path as first param', function () {

        let opts = util.opts('./tests', {});

        expect(opts.root).to.equal(path.resolve('./tests'));

    });

    it('should support absolute file paths', function () {

        let opts = util.opts('/usr/local');

        expect(opts.root).to.equal(path.resolve('/usr/local'));

    });

});
