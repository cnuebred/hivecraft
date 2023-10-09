import { CellRenderOptionsType, LibType, CoreHtmlConfigRender, CorePdfConfigRender, CellLocation } from "./d"
import { CELL_RENDER_OPTIONS_DEFAULT, IMPORT_LIBS_LIST } from './utils'
import { readFile, writeFile } from "fs/promises"
import { transform } from "./bundle"
import { Cell } from "./cell"
import { CellReplacements } from "./replace"
import path from "path"


export class Core extends Cell {
    html_string: string = ''
    caller: path.ParsedPath
    #header: Cell
    constructor() {
        super('core')
        this.header_constructor(false)
        this.caller = path.parse('/' +(new Error()).stack.split("\n")[2].split(path.sep).slice(1)
        .join(path.sep).split(":")[0])
    }
    get header(): Cell { return this.#header }
    private header_constructor(init: boolean): void {
        if (!init) {
            this.#header = new Cell('head')
            return
        }
        this.header.add('meta').attributes = { charset: 'UTF-8' }
        this.header.add('meta').attributes = { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
        this.header.add('meta').attributes = { name: "viewport", content: 'width=device-width, initial-scale=1.0' }
        this.header.add('title {{TITLE}}').replace = { TITLE: 'Document' }

        let worker_path = path.relative(path.resolve('./'), path.join(__dirname, '../cdn/cdn.min.js'))
        if (!worker_path.startsWith('.') || !worker_path.startsWith('/')) worker_path = `./${worker_path}`
        this.worker.push_import('HCW', worker_path.replace(/\\/g, "/"), true, false)
    }
    async push_lib(lib: LibType) {
        lib.priority = true
        IMPORT_LIBS_LIST.push(lib)
        this.import_libs(lib.local)
    }
    private async import_libs(lib: string) {
        const libs = IMPORT_LIBS_LIST.find(item => item.local == lib)
        if (!libs) return
        const { local, pack, hash, href, crossorigin, referrerpolicy, async } = libs
        libs.type = !libs.type ? (href.endsWith('.js') ? 'script' : 'style') : libs.type
        let tag = libs.type == 'style' ? 'link' : 'script'
        const href_lib = new Cell(tag)

        const default_lib_set = {
            local: local,
            package: pack,
            [libs.type == 'style' ? 'href' : 'src']: href,
            integrity: hash || null,
            crossorigin: crossorigin || 'anonymous',
            referrerpolicy: referrerpolicy || 'no-referrer',
        }
        if (libs.type == 'style')
            default_lib_set.rel = 'stylesheet'
        else {
            if (async) href_lib.attributes.set('$', 'async')
            default_lib_set.type = 'module'
            // default_lib_set.type = 'text/javascript'
        }

        href_lib.attributes.from(default_lib_set)
        this.#header.push(href_lib, CellLocation.End)
    }
    private async generate_styles() {
        let text = ''
        const imports: typeof this.style.imports_list = []
        await this.for_each((item: Cell) => {
            if (item.style.empty()) return
            text += item.style.render()
            imports.push(...item.style.imports_list)
        }, { only: 'block', self: true })
        for (let item of imports) {
            if (item.url)
                text += `@import ${item.render};\n`
            else {
                await readFile(item.render).then(data => {
                    text = data.toString() + text
                })
            }
        }
        return text
    }
    private async generate_scripts() {
        let text = ''
        const imports: typeof this.worker.imports_list = []
        text += `let HIVECRAFT_WORKER;window.onload = () => {
        Object.entries(exports).forEach(([name, exported]) => window[name] = exported);
        Object.freeze(exports);HIVECRAFT_WORKER = new CoreWorker().before_start();`
        this.for_each(async (item: Cell) => {
            if (item.worker.empty()) return
            text += item.worker.join()
            imports.push(...item.worker.imports_list)
        }, { only: 'block', self: true })
        let import_ctx = ';const exports = {};'
        for (let item of imports) {
            if (item.href.startsWith('http') || item.file) {
                this.push_lib({
                    href: item.href,
                    local: item.local,
                    pack: item.local,
                    async: item.async
                })
                import_ctx += `import * as ${item.local} from '${item.href}';exports['${item.local}']=${item.local};`
            } else {
                await readFile(item.href).then(data => {
                    import_ctx = import_ctx + data.toString()
                })
            }
        }
        text = import_ctx + text + 'HIVECRAFT_WORKER.after_start();};'
        return text
    }
    async scripts() {
        const script = new Cell('script')
        script.attributes.set('type', 'module')
        const script_raw = await this.generate_scripts()
        const scripts_trans = await transform(script_raw, 'ts')
        script.text(scripts_trans)
        script.set_render_options({ no_script: true, markdown: false })
        this.push(script)
        const libs_to_import = ['HIVECRAFT_WORKER']
        for (let match of scripts_trans.matchAll(/(\w+\.imports)((\.|\[')(\w+))/gm)) libs_to_import.push(match[4])

        IMPORT_LIBS_LIST.forEach(item => { if (item.type == 'style') libs_to_import.push(item.local) })

        libs_to_import.filter((item, index, arr) => arr.indexOf(item) == index)
            .forEach(async item => await this.import_libs(item))

        return script
    }
    async styles() {
        const style = new Cell('style')
        const style_raw = await this.generate_styles()
        const style_trans = await transform(style_raw, 'css')
        style.text(style_trans)
        style.set_render_options({ no_script: true, markdown: false })
        this.push(style)

        return style
    }

    async build(config: CellRenderOptionsType = {}) {
        this.header_constructor(true)
        await this.scripts()
        await this.styles()

        if (config.no_script == undefined) config.no_script = true
        const html = new Cell('html')
        html.attributes.set('lang', '{{LANG}}')
        html.replace = this.replace.copy()
        html.replace.set('LANG', 'en')
        html.push(this.header)
        html.push(new Cell('body').push(this))
        this.html_string = html.render(config)
        return new Build(this.html_string, html.replace.copy(), this.caller)
    }
}

export class Build {
    site: string
    replace: CellReplacements
    caller: path.ParsedPath
    constructor(site: string, replace: CellReplacements, caller: path.ParsedPath) {
        this.site = site
        this.replace = replace
        this.caller = caller
    }
    get size() { return Buffer.byteLength(this.site) }
    html(replace: { [index: string]: string | number }, config: CoreHtmlConfigRender = CELL_RENDER_OPTIONS_DEFAULT): string {
        this.replace.separator = config.replace_global_separator
        let new_site = this.replace.filter(this.site)

        const my_replace = new CellReplacements()
        my_replace.separator = config.replace_global_separator
        my_replace.from(replace)
        new_site = my_replace.filter(new_site)

        if (config.to_file)
            {                
                const path_render = path.join(this.caller.dir, config.to_file)
                writeFile(path_render, new_site)
            }
        return new_site
    }
}