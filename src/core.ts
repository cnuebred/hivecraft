import { CellRenderOptionsType, LibType, CoreHtmlConfigRender, CorePdfConfigRender, CellLocation } from "./d"
import { IMPORT_LIBS_LIST } from './utils'
import { readFile, writeFile } from "fs/promises"
import { transform } from "./bundle"
import { Cell } from "./cell"
import { CellReplacements } from "./replace"

export class Core extends Cell {
    html_string: string = ''
    private _header: Cell
    constructor() {
        super('core')
        this.header_constructor(false)
    }
    get header(): Cell { return this._header }
    private header_constructor(init: boolean): void {
        this._header = new Cell('head')
        if (!init) return
        this.header.add(':meta').attributes = { charset: 'UTF-8' }
        this.header.add(':meta').attributes = { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
        this.header.add(':meta').attributes = { name: "viewport", content: 'width=device-width, initial-scale=1.0' }
        this.header.add(':title TITLE').replace = { TITLE: 'Document' }
    }
    async push_lib(lib: LibType) {
        lib.priority = true
        IMPORT_LIBS_LIST.push(lib)
        this.import_libs(lib.local)
    }
    private async import_libs(lib: string) {
        const libs = IMPORT_LIBS_LIST.find(item => item.local == lib)
        if (!libs) return
        const { local, pack, hash, href, crossorigin, referrerpolicy } = libs
        libs.type = !libs.type ? (href.endsWith('.js') ? 'script' : 'style') : libs.type
        let tag = libs.type == 'style' ? 'link' : 'script'

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

        const href_lib = new Cell(tag)
        href_lib.attributes.from(default_lib_set)
        this._header.push(href_lib, CellLocation.End)
    }
    private async generate_styles() {
        let text = ''
        const imports: typeof this.style.imports = []
        await this.forEach((item: Cell) => {
            if (item.style.empty()) return
            text += item.style.join()
            imports.push(...item.style.imports)
        }, { only: 'block', self: true })

        for (let item of imports) {
            if (item.url)
                text += `@import ${item.source};\n`
            else
                await readFile(item.source).then(data => {
                    text = data.toString() + text
                })
        }
        return text
    }
    private async generate_scripts() {
        let text = ''
        text += `let HIVECRAFT_WORKER; HIVECRAFT_WORKER = new CoreWorker().init();`
        this.forEach(async (item: Cell) => {
            if (item.worker.empty()) return
            text += item.worker.join()
        }, { only: 'block', self: true })
        return text
    }
    async build(config: CellRenderOptionsType = {}) {
        const script = new Cell('script')
        const style = new Cell('style')
        this.header_constructor(true)

        const script_raw = await this.generate_scripts()
        const style_raw = await this.generate_styles()

        const scripts_trans = await transform(script_raw, 'ts')
        const style_trans = await transform(style_raw, 'css')

        script.text(scripts_trans).category = 'script'
        style.text(style_trans).category = 'style'


        script.set_render_options({ no_script: true })
        this.set_render_options({ no_script: true })

        this.push(script)
        this.push(style)
        const libs_to_import = ['HIVECRAFT_WORKER'] // to import !important put in Render option
        for (let match of scripts_trans.matchAll(/(\w+\.imports)((\.|\[')(\w+))/gm)) libs_to_import.push(match[4])

        IMPORT_LIBS_LIST.forEach(item => { if (item.type == 'style') libs_to_import.push(item.local) })

        libs_to_import.filter((item, index, arr) => arr.indexOf(item) == index)
            .forEach(async item => await this.import_libs(item))

        if (config.no_script == undefined) config.no_script = true
        this.html_string = this.header.render(config) + this.render(config)
        return new Build(this.html_string, this.replace.copy())
    }
}

export class Build {
    site: string
    replace: CellReplacements
    constructor(site: string, replace: CellReplacements) {
        this.site = site
        this.replace = replace
    }
    get size() { return Buffer.byteLength(this.site) }
    html(replace: { [index: string]: string | number }, config: CoreHtmlConfigRender = {}): string {
        this.replace.separator = config.replace_global_separator
        let new_site = this.replace.filter(this.site)

        const my_replace = new CellReplacements()
        my_replace.separator = config.replace_global_separator
        my_replace.from(replace)
        new_site = my_replace.filter(new_site)

        if (config.to_file)
            writeFile(config.to_file, new_site)
        return new_site
    }
    pdf(name: string, config?: CorePdfConfigRender) { } //TODO

}