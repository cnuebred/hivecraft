import { randomBytes } from "crypto"
import { CellLocation, CellRenderOptionsType, CellStyleObject, ForEachFilter, HashType, } from "./d"
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
    private _parent: Cell
    private _style: CellStyle
    private _worker: CellWorker
    private _replace: CellReplacements
    private _attributes: CellAttributes
    private cell_render_options_type: CellRenderOptionsType
    set tag(value: string) {
         this._tag = value 
         if(this._worker)
            this._worker.query = this.query
         if(this._style)
            this._style.query = this.query
        }
    get tag() { return this._tag }
    get hash() { return `v_${this._hash}` }
    get chain() { return `${this.parent.chain}.${this.hash}` }
    get query() { return `${this.tag}[${this.hash}]` }

    set parent(value: Cell){
        this._parent = value
        this.replace = value.replace || new CellReplacements()
    }
    get parent(){
        return this._parent
    }

    set worker(value: CellWorker) {
        value.query = this.query
        value.owner = this
        this._worker = value
    }
    get worker(): CellWorker{ return this._worker }

    set style(value: CellStyleObject | CellStyle) {
        if(value instanceof CellStyle){
            value.query = this.query
            value.owner = this
            this._style = value
        }else{
            this._style = new CellStyle()
            this._style.query = this.query
            this._style.owner = this
            this._style.from(value)
        }
    }
    get style(): CellStyle { return this._style }

    set attributes(value: {[index:string]: string | number | boolean} | CellAttributes){
        if(value instanceof CellAttributes){
            this._attributes = value
        }else{
            this._attributes = new CellAttributes()
            this._attributes.from(value)
        }
    }
    get attributes(): CellAttributes{return this._attributes}

    set replace(value: {[index:string]: string | number} | CellReplacements){
        if(value instanceof CellReplacements){
            this._replace = value
        }else{
            this._replace = new CellReplacements()
            this._replace.from(value)
        }
    }
    get replace(): CellReplacements{return this._replace}

    constructor(tag: string = 'div', attributes?: CellAttributes, replace?: CellReplacements, style?: CellStyle, worker?: CellWorker) {
        this.tag = tag
        this._attributes = attributes || new CellAttributes()
        this.replace = replace || new CellReplacements()
        this.style = style || new CellStyle()
        this.worker = worker || new CellWorker()
        this._attributes.set('$hash', this.hash)
    }
    set_render_options(options: CellRenderOptionsType): Cell {
        this.cell_render_options_type = { ...CellRenderOptionsDefault, ...options }
        return this
    }
    render(options: CellRenderOptionsType = {}): string {
        options = { ...CellRenderOptionsDefault, ...options, ...this.cell_render_options_type }

        const template = []
        template.push(`<${this.tag} ${this.attributes.render()}>`)

        this._content.forEach(item => {
            template.push(item.render(options))
        })
        
        if (!options.close && !SINGLE_MARKS.includes(this.tag))
            template.push(`</${this.tag}>`)
        if (!options.no_script)
            template.push(this.worker.generate().render({ no_script: true }))

        return template.join('')
    }
    ref(name: string): Cell {
        this._attributes.set('ref', name)
        return this
    }
    text(text: string, clear: boolean = false): CellText {
        if(clear)
            this._content = []
        const text_node = new CellText(text)
        this.push(text_node)
        return text_node
    }
    cell(tag: string, location?: CellLocation, attributes?: CellAttributes, replace?: CellReplacements, style?: CellStyle, worker?: CellWorker): Cell {
        const cell = new Cell(tag, attributes, replace, style, worker)
        this.push(cell, location)
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
    forEach(callback: (item: Cell | CellText, index: number) => void, filter?: ForEachFilter, index: number = 0) {
        if(filter.self)
            callback(this, index)
        filter.self = true
        this._content.forEach(element => {
            if (element instanceof CellText && (!filter?.only || filter?.only == 'text'))
            callback(element, index)
            
            if (element instanceof Cell && (!filter?.only || filter?.only == 'block'))
            if (!filter.tag || filter.tag.includes(element.tag))
                element.forEach(callback, filter, index)
            index++
        })
    }
    copy(): Cell {
        const cell_copy = new Cell(this.tag, this._attributes.copy(), this.replace.copy())
        cell_copy.style = this.style.copy()
        cell_copy.worker = this.worker.copy()
        this._content.forEach((item) => {
            cell_copy.push(item.copy())
        })
        return cell_copy
    }
    private meta_extractor(carbee_struct: string) {
        const [meta, ...content] = carbee_struct.split(' ')
        this.tag = meta.match(meta_regex.tag)?.[0]
        this._attributes.set('id', meta.match(meta_regex.id)?.[0] || '')
        this._attributes.append('class', meta.match(meta_regex.class)?.join(' ') || '')
        this._attributes.set('ref', meta.match(meta_regex.ref)?.[0] || '')

        this.text(content.join(' '))
    }
}
