import { build } from 'esbuild'
import { sassPlugin } from "esbuild-sass-plugin";
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

const files = ['my']
export const bundle_script_assets = async () => {
    build({
        entryPoints: [...files.map(f => { return `./src/scripts/${f}.worker.ts` }), './src/scripts/style.scss'],
        outdir: './src/scripts/build',
        platform: 'node',
        bundle: true,
        minify: true,
        sourcemap: true,
        plugins: [
            sassPlugin({
                async transform(source) {
                    const { css } = await postcss([autoprefixer]).process(source, {from: undefined});
                    return css;
                },
            }),
        ],
    }).then(data => {
        console.log('✨ Build successful ✨')
    }).catch(err => {
        console.log(err)
        process.exit(1);
    })
}