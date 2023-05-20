import { texts } from "./app.txt"
import { Core } from "./src/core"
import { Form } from "./src/modules/form"

// const app = () => {
//     const container = new Cell('div')
//     container.text('Here is title').wrap('h1')
//     const p = container.cell('p')
//     p.text('Here is little description').wrap('u', 'i')
//     p.attributes.push('s', 'hash')

//     container.cell('div').text('footer for [lp]').wrap('b').replace.set('[lp]', 'Cube')

//     const button = container.cell('button')

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
    const core = new Core()

    core.cell('h1').text(texts.title)
    const p = core.cell('p').text(texts.description)
    const p_2 = core.cell('p').text(texts.description_interactive)
    const div = core.cell('div')
    div.style.class('container')
    div.new(':p.container_paragraph')
    .text(texts.text_first)
    div.new(':h2.header_second ' + texts.analyses)
    // const p_2 = core.cell('p').text('Here is ||little|| description')
    // p.parent.worker.click().callback((cog) => {
    //     console.log('pyk')
    //     console.log(cog.item)
    //     console.log(cog.self)
    //     console.log(cog.proxy)
    //     cog.proxy['little'] = 'ok'
    //     console.log(cog.imports.crypto.SHA256("Message").toString())

    //     cog.proxy.tg = '10'
    // })
    p_2.parent.worker.click().callback((cog) => {
        console.log('pyk')
        console.log(cog.item)
        console.log(cog.proxy)
    })

    const form = new Form('test')
    form.add('text').label('name', 'Here is name')

    div.push(form)

    div.style.import('./app.scss', __dirname)
    core.style.add({
        style: {
            fontFamily: `'Roboto Mono', monospace`
        }
    })
    //p.parent.style.path('./app.scss')

    // core.bundle()
    core.to_html({'[user]': 'Cube'}, {to_file:'index.html'})
}

app()


