import { Readable } from 'node:stream';

describe('Walk', () => {

    it('instance of Readable', () => {
        expect(walk('index.js')).to.be.instanceOf(Readable);
    });

    it('return promise', () => {
        expect(walk('index.js').promise()).to.be.instanceOf(Promise);
    });

    it('walk as stream', done => {
        let count = 0;
        let read = walk('tests');
        read.on('data', file => {
            count++;
        });
        read.on('end', () => {
            expect(count).to.equal(5);
            done();
        });
    });

    it('walk async', () => {
        return walk('index.js').promise().then(res => {
            expect(res).to.exist;
            expect(res).to.be.an('array');
        });
    });

    it('walk sync', () => {
        let res = sync('index.js');
        expect(res).to.exist;
        expect(res).to.be.an('array');
    });

    it('support single file lookups', () => {
        let res = sync('index.js');
        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);
    });

    it('support require style lookups', () => {
        let res = sync('index', { require: true });
        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);
    });

    it('include dot files', () => {
        let res = sync('.gitignore', { dot: true });
        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);
    });

    it('exclude dot files', () => {
        let res = sync('.gitignore', { dot: false });
        expect(res).to.be.empty;
        expect(res).to.be.an('array');
    });

    it('support filtering for includes', () => {
        let res = sync('tests', { src: '_setup.js' });
        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);
    });

    it('support filtering for excludes', () => {
        let res = sync('tests', { ignore: '_setup.js' });
        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(4);
    });

    it('not exclude root walk path', () => {
        let res = sync('./tests/_setup.js', { ignore: '_setup.js' });
        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);
    });

    it('support both includes and excludes', async () => {
        let res = await walk('./tests', { src: '(_setup|walk).js', ignore: '_setup.js' }).promise();
        expect(res).to.exist;
        expect(res).to.be.an('array');
        expect(res.length).to.equal(1);
    });

});
