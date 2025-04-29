import { isModule } from 'lo';
import { Buffer } from 'node:buffer';
import { Readable } from 'node:stream';

describe('File', () => {

    it('instance of File', () => {
        expect(file).to.be.instanceOf(File);
    });

    it('properties', () => {
        expect(file.cwd).to.exist;
        expect(file.root).to.exist;
        expect(file.path).to.exist;
        expect(file.relative).to.exist;
        expect(file.relativeFromCwd).to.exist;
        expect(file.dir).to.exist;
        expect(file.base).to.exist;
        expect(file.name).to.exist;
        expect(file.ext).to.exist;
        expect(file.stat).to.exist;
        expect(file.contents).to.be.undefined;
        expect(file.encoding).to.exist;
    });

    it('read contents as string async', async () => {
        expect(await file.readStr()).to.be.a('string');
    });

    it('read contents as string sync', () => {
        expect(file.readStrSync()).to.be.a('string');
    });

    it('read contents by require', () => {
        let [file] = sync('dist/cjs/index.cjs');
        expect(file.require()).to.be.a('object');
    });

    it('read contents by import', async () => {
        expect(isModule(await file.import())).to.be.true;
    });

    it('read contents as buffer', async () => {
        expect(await file.readBuf()).to.be.instanceOf(Buffer);
    });

    it('read contents as readable stream', () => {
        expect(file.createReadStream()).to.be.instanceOf(Readable);
    });

    it('set relative path based on root', async () => {
        expect(file.relative).to.equal('');
        expect(file.relativeFromCwd).to.equal('index.js');
        let [constants] = await walk('lib/constants', { require: true }).promise();
        expect(constants.relative).to.equal('');
        expect(constants.relativeFromCwd).to.equal('lib/constants.js');
    });

    it('get encoding from bom', async () => {
        let [file] = await walk('tests/bom.txt').promise();
        expect(await file.getEncodingFromBOM()).to.equal('utf7');
        expect(file.getEncodingFromBOMSync()).to.equal('utf7');
    });

});
