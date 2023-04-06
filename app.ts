import { writeFile } from "fs"
import { Brick } from "./src/core"

const app = () => {
    const container = new Brick('div')
    container.text('Here is title').wrap('h1')
    const p = container.brick('p')
    p.text('Here is little description').wrap('u', 'i')
    p.attributes.push('s', 'hash')

    container.brick('div').text('footer for [lp]').wrap('b').replace.set('[lp]', 'Cube')

    const button = container.brick('button')
    button.worker.click((cog) => {
        cog.proxy.generator = 'ok'
    })

    console.log(container.copy().render())
    console.log()
    console.log(container.render())
    writeFile('index.html', container.render(), (err) => {
        if(err) console.log(err)
        return 
    })
}

app()
