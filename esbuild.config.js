const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const config = {
    entryPoints: ['src/main.ts'],
    bundle: true,
    outfile: 'dist/bundle.js',
    sourcemap: true,
    minify: !isWatch,
    target: ['esnext'],
    format: 'iife', // Use IIFE for simple browser inclusion
    loader: {
        '.ts': 'ts',
    },
};

if (isWatch) {
    esbuild.context(config).then(ctx => {
        console.log('Watching...');
        ctx.watch();
    }).catch(() => process.exit(1));
} else {
    esbuild.build(config).catch(() => process.exit(1));
}
