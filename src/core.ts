import { randomBytes } from "crypto"
import { ForEachFilter, CellRenderOptionsDefault, CellRenderOptionsType, HashType, LibType, PATHS, WORKER_NAME, WrapperType, IMPORT_LIBS_LIST, CoreHtmlConfigRender, CorePdfConfigRender, CellLocation } from "./d"
import { CellWorker } from "./worker"
import { CellStyle } from "./style"
import { readFile, writeFile } from "fs/promises"
import { bundle_script_assets } from "./bundle"
import { appendFile } from "fs"
import { CellReplacements } from "./replace"
import { Cell } from "./cell"

export class Core extends Cell {
    html_string: string
    constructor() { super('core') }
    async bundle() {
        await bundle_script_assets()
    }
    async push_lib(lib: LibType) {
        IMPORT_LIBS_LIST.push(lib)
    }
    private async import_libs() {
        IMPORT_LIBS_LIST.forEach(({ local, variable, href, hash }) => {
            const href_lib = new Cell('script')
            href_lib.attributes.from({
                ref_href_lib: local,
                name_href_lib: variable,
                src: href,
                integrity: hash,
                crossorigin: 'anonymous',
                referrerpolicy: 'no-referrer',
            })
            this.push(href_lib, CellLocation.Start)
        })
    }
    private async generate_styles() {
        this.style.import(PATHS.local_style, __dirname)
        await writeFile(PATHS.my_style, '')
        this.forEach(async (item: Cell) => {
            await appendFile(
                PATHS.my_style,
                item.style.imports.map(item => `@import ${item};`).join('\n')+'\n', (err) => {
                    if (err) console.log(err)
                })
        }, {only: 'block'})

        this.forEach(async (item: Cell) => {
            if (item.style.empty()) return
            await appendFile(PATHS.my_style, item.style.join(), (err) => {
                if(err) console.log(err)
            })
        }, { only: 'block' })
    }
    private async generate_scripts() {
        await writeFile(
            PATHS.my_worker,
            `import { ${WORKER_NAME} } from "${PATHS.local_worker}";\n`,
        )
        this.forEach(async (item: Cell) => {
            if (item.worker.empty()) return
            await appendFile(PATHS.my_worker, item.worker.join(), (err) => {
                if(err) console.log(err)
            })
        }, { only: 'block' })
    }

    async build(bundle?: boolean, config: CellRenderOptionsType = {}) {
        const script = new Cell('script')
        const style = new Cell('style')
        await this.generate_scripts()
        await this.generate_styles()

        if (bundle)
            await this.bundle()

        const core_bundler_script = await readFile(PATHS.bundle_worker)
        const core_bundler_style = await readFile(PATHS.bundle_style)

        script.text(core_bundler_script.toString()).category = 'script'
        style.text(core_bundler_style.toString()).category = 'style'


        script.set_render_options({ no_script: true })
        this.set_render_options({ no_script: true })

        this.push(script)
        this.push(style)
        await this.import_libs()

        if(config.no_script == undefined) config.no_script = true
        this.html_string = this.render(config)

    }
    async to_html(replace: {[index:string]: string}, config: CoreHtmlConfigRender = {}): Promise<string>{
        await this.build(true, config)
        this.replace.from(replace)
        this.html_string = this.replace.filter(this.html_string)
        if(config.to_file)
            await writeFile(config.to_file, this.html_string)
        return this.html_string 
    }
    to_pdf(name: string, config?: CorePdfConfigRender) { }

}