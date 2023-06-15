import { Cell } from "./cell"
import { CellRenderOptionsType, WrapperType } from "./d"
import { CellReplacements } from "./replace"

export class CellText {
    type: string = 'text'
    text: string
    replace: CellReplacements
    private _category: string = 'text'
    private _parent: Cell
    private wrapper: WrapperType[] = []

    get category() { return this._category }
    set category(value: string) { this._category = value }

    set parent(value: Cell){
        this._parent = value
        this.replace = value.replace || new CellReplacements()
    }
    get parent(){
        return this._parent
    }
    constructor(text: string, replace?: CellReplacements) {
        this.text = text
        this.replace = replace
    }
    render(options?: CellRenderOptionsType): string {
        if (options?.replace)
            this.text = this.replace.filter(this.text)

        if (options?.proxy?.start && this.category == 'text')
            this.proxy_applier(options)

        if (options?.wrappers)
            this.attach_wrappers()

        return this.text
    }
    wrap(...wraps: WrapperType[]): CellText {
        this.wrapper = [...this.wrapper, ...wraps]
        return this
    }
    copy(): CellText {
        const cell_text_copy = new CellText(this.text)
        cell_text_copy.wrapper = this.wrapper
        cell_text_copy.replace = this.replace
        return cell_text_copy
    }
    private proxy_applier(options?: CellRenderOptionsType) {
        if (!options.proxy?.end)
            options.proxy.end = options.proxy.start
        const proxy_span = (match, _1) => `<span proxy_data="${_1}"></span>`
        this.text = this.text.replaceAll(/\|\|([\w.]+)\|\|/gm, proxy_span)
    }
    private attach_wrappers() {
        this.wrapper.map(item => {
            this.text = `<${item}>${this.text}</${item}>`
        })
    }
}
