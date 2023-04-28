import { build } from 'esbuild'


const files = ['my']
export const bundle_script_assets = async () => {
    await build({
        entryPoints: files.map(f => { return `./src/scripts/${f}.worker.ts` }),
        outdir: './src/scripts/build',
        platform: 'node',
        bundle: true,
        minify: true,
        sourcemap: true
    })
}