import { randomBytes } from "crypto"
import { CellLocation, CellRenderOptionsType, ForEachFilter, HashType, } from "./d"
import { CellStyle } from "./style"
import { CellText } from "./text"
import { CellWorker } from "./worker"
import { CellAttributes } from "./attributes"
import { CellReplacements } from "./replace"
import { CellRenderOptionsDefault, SINGLE_MARKS, meta_regex } from "./utils"

export class Cell {
    private _type: string = 'block'
    public get type(): string {
        return this._type
    }
    public set type(value: string) {
        this._type = value
    }
    _hash: HashType = randomBytes(4).toString('hex')
    _content: (CellText | Cell)[] = []
    _tag: string = 'div'
    public parent: Cell
    private _style: CellStyle
    private _worker: CellWorker
    public replace: CellReplacements
    public attributes: CellAttributes
    private cell_render_options_type: CellRenderOptionsType
    set tag(value: string) { this._tag = value }
    get tag() { return this._tag }
    get hash() { return `v_${this._hash}` }
    get chain() { return `${this.parent.chain}.${this.hash}` }
    get query() { return `${this.tag}[${this.hash}]` }

    set worker(value: CellWorker) {
        value.query = this.query
        value.owner = this
        this._worker = value
    }
    get worker() { return this._worker }

    set style(value: CellStyle) {
        value.query = this.query
        value.owner = this
        this._style = value
    }
    get style() { return this._style }
    constructor(tag: string = 'div', attributes?: CellAttributes, replace?: CellReplacements, style?: CellStyle, worker?: CellWorker) {
        this.tag = tag
        this.attributes = attributes || new CellAttributes()
        this.replace = replace || new CellReplacements()
        this.style = style || new CellStyle()
        this.worker = worker || new CellWorker()
        this.attributes.set('$hash', this.hash)
    }
    set_render_options(options: CellRenderOptionsType): Cell {
        this.cell_render_options_type = { ...CellRenderOptionsDefault, ...options }
        return this
    }
    render(options: CellRenderOptionsType = {}): string {
        options = { ...CellRenderOptionsDefault, ...options, ...this.cell_render_options_type}

        const template = []
        template.push(`<${this.tag} ${this.attributes.render()}>`)

        this._content.forEach(item => {
            template.push(item.render(options))
        })

        if(!options.close && !SINGLE_MARKS.includes(this.tag))
        template.push(`</${this.tag}>`)
        if (!options.no_script)
            template.push(this.worker.generate().render({ no_script: true }))

        return template.join('')
    }
    ref(name: string): Cell {
        this.attributes.set('ref', name)
        return this
    }
    text(text: string): CellText {
        const text_node = new CellText(text)
        this.push(text_node)
        return text_node
    }
    cell(tag: string, attributes?: CellAttributes): Cell {
        const cell = new Cell(tag, attributes)
        this.push(cell)
        return cell
    }
    push(cell_component: Cell | CellText, location: CellLocation = CellLocation.End): Cell {
        if (location == CellLocation.Start) {
            cell_component.parent = this
            this._content.splice(0, 0, cell_component)
        }
        else if (location == CellLocation.End) {
            cell_component.parent = this
            this._content.push(cell_component)
        }
        else if (location == CellLocation.After && this.parent)
            this.parent._content.splice(this.parent._content.indexOf(this) + 1, 0, cell_component)
        else if (location == CellLocation.Before && this.parent)
            this.parent._content.splice(this.parent._content.indexOf(this), 0, cell_component)
        return this
    }
    add(carbee_struct: string, location?: CellLocation, attributes?: CellAttributes, replace?: CellReplacements, style?: CellStyle, worker?: CellWorker): Cell {
        const cell = new Cell('div', attributes, replace, style, worker)
        cell.meta_extractor(carbee_struct)
        this.push(cell, location)
        return cell
    }
    forEach(callback: (item: Cell | CellText) => void, filter?: ForEachFilter) {
        callback(this)
        this._content.forEach(element => {
            if (element instanceof CellText && filter?.only == 'text')
                callback(element)
            else if (element instanceof Cell && filter?.only == 'block')
                element.forEach(callback, filter)
        })
    }
    copy(): Cell {
        const cell_copy = new Cell(this.tag, this.attributes.copy(), this.replace.copy())
        cell_copy.style = this.style.copy()
        cell_copy.worker = this.worker.copy()
        this._content.forEach((item) => {
            cell_copy.push(item.copy())
        })
        return cell_copy
    }
    private meta_extractor(carbee_struct: string) {
        const [meta, ...content] = carbee_struct.split(' ')
        this._tag = meta.match(meta_regex.tag)?.[0]
        this.attributes.set('id', meta.match(meta_regex.id)?.[0] || '')
        this.attributes.append('class', meta.match(meta_regex.class)?.join(' ') || '')
        this.attributes.set('ref', meta.match(meta_regex.ref)?.[0] || '')

        this.text(content.join(' '))
    }
}
