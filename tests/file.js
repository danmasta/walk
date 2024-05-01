describe('File', () => {

    it('should be an instance of File', () => {
        return walk('./index').each(file => {
            expect(file).to.be.instanceOf(File);
        });
    });

    it('should have correct properties and methods', () => {

        return walk('./index').each(file => {
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
            expect(file.createReadStream).to.be.a('function');
            expect(file.createWriteStream).to.be.a('function');
            expect(file.append).to.be.a('function');
            expect(file.read).to.be.a('function');
            expect(file.readAsString).to.be.a('function');
            expect(file.readAsBuffer).to.be.a('function');
            expect(file.readStr).to.be.a('function');
            expect(file.readBuf).to.be.a('function');
            expect(file.write).to.be.a('function');
            expect(file.require).to.be.a('function');
            expect(file.import).to.be.a('function');
            expect(file.requireOrImport).to.be.a('function');
            expect(file.requireImportOrRead).to.be.a('function');
            expect(file.isModule).to.be.a('function');
            expect(file.isBuffer).to.be.a('function');
            expect(file.isStream).to.be.a('function');
            expect(file.isNull).to.be.a('function');
            expect(file.isNil).to.be.a('function');
            expect(file.isString).to.be.a('function');
            expect(file.isDirectory).to.be.a('function');
            expect(file.isSymbolicLink).to.be.a('function');
            expect(file.isBlockDevice).to.be.a('function');
            expect(file.isCharacterDevice).to.be.a('function');
            expect(file.isFIFO).to.be.a('function');
            expect(file.isFile).to.be.a('function');
            expect(file.isSocket).to.be.a('function');
            expect(file.isEmpty).to.be.a('function');
            expect(file.getEncodingFromBOM).to.be.a('function');
        });

    });

    it('should read contents as string async', () => {

        return walk('./index').each(file => {
            return file.readStr().then(res => {
                expect(res).to.be.a('string');
            });
        });

    });

    it('should read contents as string sync', () => {

        sync('./index').forEach(file => {
            expect(file.readStr()).to.be.a('string');
        });

    });

    it('should read contents by require', () => {

        return walk('./index').each(file => {
            expect(file.require()).to.be.a('function');
        });

    });

    it('should read contents as buffer', () => {

        return walk('./index').each(file => {
            return file.readBuf().then(res => {
                expect(res).to.be.instanceOf(Buffer);
            });
        });

    });

    it('should read contents as read stream', () => {

        return walk('./index').each(file => {
            expect(file.createReadStream()).to.be.instanceOf(stream.Readable);
        });

    });

    it('should set relative path based on root', () => {

        return walk('./index').each(file => {
            expect(file.relative).to.equal('');
            expect(file.relativeFromCwd).to.equal('index.js');
        });

    });

});
