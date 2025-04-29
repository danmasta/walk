import pluginCJS from '@rollup/plugin-commonjs';
import pluginNodeResolve from '@rollup/plugin-node-resolve';

export default [
    {
        input: [
            'index.js'
        ],
        output: {
            dir: 'dist/cjs',
            format: 'cjs',
            sourcemap: false,
            strict: false,
            preserveModules: true,
            exports: 'named',
            entryFileNames: '[name].[format]',
            esModule: false
        },
        external: [
            'lo',
            'lo/errors',
            'picomatch'
        ],
        plugins: [
            pluginCJS(),
            pluginNodeResolve()
        ]
    }
];
