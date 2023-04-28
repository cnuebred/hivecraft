import { randomBytes } from "crypto"
import { ForEachFilter, HashType, QueryType, WrapperType } from "./d"
import { BrickWorker } from "./worker"
import { BrickStyle } from "./style"
import { readFile, writeFile } from "fs/promises"
import { bundle_script_assets } from "./scripts/bundle"
import { appendFile } from "fs"


type BrickRenderOptionsType = {
    close?: boolean
    no_script?: boolean
    proxy?: {
        start: string,
        end?: string,
    }
    wrappers?: boolean
    replace?: boolean
    replace_global_separator?: {
        start?: string,
        end?: string
    }
}
const BrickRenderOptionsDefault: BrickRenderOptionsType = {
    wrappers: true,
    no_script: false,
    proxy: {
        start: '||',
    },
    replace: false,
    replace_global_separator: {
        start: '',
        end: ''
    }
}


export class BrickReplacements {
    replacement: { [index: string]: string } = {}
    separator: string = ''
    filter(text: string): string {
        Object.entries(this.replacement).forEach(([key, value]) => {
            text = text.replaceAll(key, value)
        })
        return text
    }
    set(key: string, value: string) {
        this.replacement = { ...this.replacement, ...{ [key]: value } }
    }

}

export class BrickAttributes {
    private attributes: { [index: string]: string | number | null } = {}
    constructor() { }
    render(): string {
        return Object.entries(this.attributes).map(([key, value]) => {
            if (!value) return `${key}`
            if (key.startsWith('$')) return `${value}`
            return `${key}="${value}"`
        }).join(' ')
    }
    push(key: string, value: string | number | null): BrickAttributes {
        this.attributes = { ...this.attributes, ...{ [key]: value } }
        return this
    }
    from(attributes: { [index: string]: string | number | null }): BrickAttributes {
        this.attributes = { ...this.attributes, ...attributes }
        return this
    }
    get(key: string): string | number | null {
        return this.attributes[key] || null
    }
    copy() {
        return new BrickAttributes().from(this.attributes)
    }
}
export class BrickText {
    type: string = 'text'
    text: string
    replace: BrickReplacements
    private _category: string = 'text'
    public parent: Brick
    private wrapper: WrapperType[] = []

    get category() { return this._category }
    set category(value: string) { this._category = value }

    constructor(text: string, replace?: BrickReplacements) {
        this.text = text
        this.replace = replace || new BrickReplacements()
    }
    render(options?: BrickRenderOptionsType): string {
        if (options?.replace)
        this.text = this.replace.filter(this.text)

        if (options?.proxy?.start && this.category == 'text')
            this.proxy_applier(options)

        if (options?.wrappers)
            this.attach_wrappers()

        return this.text
    }
    wrap(...wraps: WrapperType[]): BrickText {
        this.wrapper = [...this.wrapper, ...wraps]
        return this
    }
    copy(): BrickText {
        const brick_text_copy = new BrickText(this.text)
        brick_text_copy.wrapper = this.wrapper
        brick_text_copy.replace = this.replace
        return brick_text_copy
    }
    private proxy_applier(options?: BrickRenderOptionsType) {
        if (!options.proxy?.end)
            options.proxy.end = options.proxy.start
        const proxy_span = (match, _1) => `<span proxy_data="${_1}"></span>`
        this.text = this.text.replaceAll(/\|\|(\w+)\|\|/gm, proxy_span)
    }
    private attach_wrappers(){
        this.wrapper.map(item => {
            this.text = `<${item}>${this.text}</${item}>`
        })
    }
}
export class Brick {
    type: string = 'block'
    _hash: HashType = randomBytes(4).toString('hex')
    _content: (BrickText | Brick)[] = []
    _tag: string = 'div'
    public parent: Brick
    private _style: BrickStyle
    private _worker: BrickWorker
    public attributes: BrickAttributes
    private brick_render_options_type: BrickRenderOptionsType
    set tag(value: string) { this._tag = value }
    get tag() { return this._tag }
    get hash() { return `v_${this._hash}` }
    get chain() { return `${this.parent.chain}.${this.hash}` }
    get query() { return `${this.tag}[${this.hash}]` }

    set worker(value: BrickWorker) {
        value.query = this.query
        this._worker = value
    }
    get worker() { return this._worker }

    set style(value: BrickStyle) {
        value.query = this.query
        this._style = value
    }
    get style() { return this._style }

    constructor(tag: string, attributes?: BrickAttributes, style?: BrickStyle, worker?: BrickWorker) {
        this.tag = tag
        this.attributes = attributes || new BrickAttributes()
        this.style = style || new BrickStyle()
        this.worker = worker || new BrickWorker()
        this.attributes.push('$hash', this.hash)
    }
    set_render_options(options: BrickRenderOptionsType): Brick {
        this.brick_render_options_type = { ...BrickRenderOptionsDefault, ...options }
        return this
    }
    render(options: BrickRenderOptionsType = {}): string {
        options = { ...BrickRenderOptionsDefault, ...options, }
        const template = []
        template.push(`<${this.tag} ${this.attributes.render()}>`)

        this._content.forEach(item => {
            template.push(item.render(options))
        })
        options = { ...options, ...this.brick_render_options_type }
        template.push(`</${this.tag}>`)
        // if (!options.no_script)
        //     template.push(this.worker.generate().render({ no_script: true }))

        return template.join('')
    }
    ref(name: string): Brick {
        this.attributes.push('ref', name)
        return this
    }
    text(text: string): BrickText {
        const text_node = new BrickText(text)
        this.push(text_node)
        return text_node
    }
    brick(tag: string, attributes?: BrickAttributes): Brick {
        const brick = new Brick(tag, attributes)
        this.push(brick)
        return brick
    }
    push(brick_component: Brick | BrickText, on_start: boolean = false): Brick {
        brick_component.parent = this
        if (on_start)
            this._content.splice(0, 0, brick_component)
        else
            this._content.push(brick_component)
        return this
    }
    forEach(callback: (item: Brick | BrickText) => void, filter?: ForEachFilter) {
        callback(this)
        this._content.forEach(element => {
            if (element instanceof BrickText && filter?.only == 'text')
                callback(element)
            else if (element instanceof Brick && filter?.only == 'block')
                element.forEach(callback)
        })
    }
    copy(): Brick {
        const brick_copy = new Brick(this.tag, this.attributes.copy())
        brick_copy.style = this.style.copy()
        brick_copy.worker = this.worker.copy()
        this._content.forEach((item) => {
            brick_copy.push(item.copy())
        })
        return brick_copy
    }
}

type CoreHtmlConfigRender = {} & BrickRenderOptionsType
type CorePdfConfigRender = {} & CoreHtmlConfigRender

const import_statement: string[][] = [
    ['CARBEE_WORKER', './event.worker']
]
const import_libs_list: string[][] = [
    [
        'crypto',
        'CryptoJS',
        'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
        'sha512-E8QSvWZ0eCLGk4km3hxSsNmGWbLtSCSUcewDQPQWZF6pEU8GlT8a5fF32wOl1i8ftdMhssTrF/OhyGWwonTcXA=='
    ]
]

export class Core extends Brick {
    constructor() { super('core') }
    async bundle() {
        await bundle_script_assets()
    }
    private async generate_scripts() {
        await writeFile(
            './src/scripts/my.worker.ts',
            import_statement.map(([variable, path]) => {
                if (path.startsWith('.'))
                    return `import { ${variable} } from "${path}";\n`
                return `import * as ${variable} from "${path}";\n`
            }),
        )
        this.forEach(async (item: Brick) => {
            if (item.worker.empty()) return
            await appendFile('./src/scripts/my.worker.ts', item.worker.join(), (err) => {
                console.log(err)
            })
        }, { only: 'block' })
    }
    async import_libs() {
        import_libs_list.forEach(([ref, name, link, integrity]) => {
            const href_lib = new Brick('script')
            href_lib.attributes.from(
                {
                    ref_href_lib: ref,
                    name_href_lib: name,
                    src: link,
                    integrity: integrity,
                    crossorigin: 'anonymous',
                    referrerpolicy: 'no-referrer',
                })
            this.push(href_lib, true)
        })
    }
    async build(bundle?: boolean) {
        const worker_base = new Brick('script')
        await this.generate_scripts()

        if (bundle)
            await this.bundle()

        const core_bundler = await readFile('./src/scripts/build/my.worker.js')

        worker_base.text(core_bundler.toString()).category = 'script'
        worker_base.set_render_options({ no_script: true })
        this.set_render_options({ no_script: true })
        this.push(worker_base)
        await this.import_libs()
        // console.log(this.render())
        // console.log(worker_base.render({ no_script: true }))

    }
    async to_html(name: string, config?: CoreHtmlConfigRender) {
        await this.build(true)
        await writeFile(name, this.render(config))
    }
    to_pdf(name: string, config?: CorePdfConfigRender) { }

}