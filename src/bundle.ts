import { transform as estransform } from 'esbuild'
import  {compileString} from 'sass'

export const transform = async (text, loader) => {
    if(loader == 'css')
        text = compileString(text, {style: 'compressed'}).css || ''
    
    const response = await estransform(text, {
        minify: true,
        loader: loader,
        platform: 'node',
        target: 'es2021'
    })
    return response.code
}