const constants = {
    GLOBS: {
        all: '*(../)*(**/)*',
        ignore: '*(../)*(**/)(.git|node_modules)',
        dot: '*(../)*(**/)!(.)*'
    },
    BOM: {
        utf8: Buffer.from([0xEF, 0xBB, 0xBF]),
        utf16be: Buffer.from([0xFE, 0xFF]),
        utf16le: Buffer.from([0xFF, 0xFE]),
        utf32be: Buffer.from([0x00, 0x00, 0xFE, 0xFF]),
        utf32le: Buffer.from([0xFF, 0xFE, 0x00, 0x00]),
        utf7: Buffer.from([0x2B, 0x2F, 0x76]),
        utf1: Buffer.from([0xF7, 0x64, 0x4C]),
        utfebcdic: Buffer.from([0xDD, 0x73, 0x66, 0x73]),
        scsu: Buffer.from([0x0E, 0xFE, 0xFF]),
        bocu1: Buffer.from([0xFB, 0xEE, 0x28]),
        gb18030: Buffer.from([0x84, 0x31, 0x95, 0x33])
    }
};

module.exports = constants;
