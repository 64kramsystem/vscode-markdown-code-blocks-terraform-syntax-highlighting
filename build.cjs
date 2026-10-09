const fs = require('node:fs');
const esbuild = require('esbuild');

esbuild.buildSync({
    entryPoints: ['extension.cjs'],
    bundle: true,
    platform: 'node',
    outfile: 'dist/extension.cjs',
    minify: true,
});
fs.copyFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'), 'dist/onig.wasm');
