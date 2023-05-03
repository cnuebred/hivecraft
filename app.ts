import { writeFile } from "fs"
import { Brick, Core } from "./src/core"
import * as crypto from "crypto"

// const app = () => {
//     const container = new Brick('div')
//     container.text('Here is title').wrap('h1')
//     const p = container.brick('p')
//     p.text('Here is little description').wrap('u', 'i')
//     p.attributes.push('s', 'hash')

//     container.brick('div').text('footer for [lp]').wrap('b').replace.set('[lp]', 'Cube')

//     const button = container.brick('button')
    
//     button.worker.click().callback((cog) => {
//         cog.proxy.generator = 'ok'
//     })

//     console.log(container.copy().render())
//     console.log(container.render())
//     writeFile('index.html', container.render(), (err) => {
//         if(err) console.log(err)
//         return 
//     })
// }

const app = async () => {
    const core  = new Core()

    core.brick('h1').text('Hello Cube')
    const p = core.brick('p').text('Here is little description')
    const p_2 = core.brick('p').text('Here is ||little|| description')
    p.parent.worker.click().callback((cog) => {
        console.log('pyk')
        console.log(cog.item)
        console.log(cog.self)
        console.log(cog.proxy)
        cog.proxy['little'] = 'ok'
        console.log(cog.imports.crypto.SHA256("Message").toString())

        cog.proxy.tg = '10'
    })
    p_2.parent.worker.click().callback((cog) => {
        console.log('pyk')
        console.log(cog.item)
        console.log(cog.proxy)
    })

    

    // core.bundle()
    core.to_html('index.html')    
}

app()
