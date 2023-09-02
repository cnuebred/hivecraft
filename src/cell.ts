import { randomBytes } from "crypto"
import { CellAttributes } from "./attributes"
import { AttrRawType, CellLocation, CellRenderOptionsType, CellStyleObject, ForEachFilter, HashType, } from "./d"
import { CellReplacements } from "./replace"
import { CellStyle, StyleObject } from "./style"
import { TxtType, txt } from "./text"
import { CELL_RENDER_OPTIONS_DEFAULT, SINGLE_MARKS, meta_regex } from "./utils"
import { CellWorker } from "./worker"

export class Cell {
    #type: string = 'block'
    get type(): string {
        return this.#type
    }
    set type(value: string) {
        this.#type = value
    }
    #hash: HashType = randomBytes(4).toString('hex')
    readonly content: (ReturnType<typeof txt> | Cell)[] = []
    #tag: string = 'div'
    #parent: Cell
    #style: CellStyle
    #worker: CellWorker
    #replace: CellReplacements
    #attributes: CellAttributes | AttrRawType
    #cell_render_options_type: CellRenderOptionsType = CELL_RENDER_OPTIONS_DEFAULT

    set tag(value: string) {
        this.#tag = value
        if (this.#worker)
            this.#worker.query = this.query
        if (this.#style)
            this.#style.query = this.query
    }
    get tag() { return this.#tag }
    get hash() { return `v_${this.#hash}` }
    get chain() { return `${this.parent?.chain || ''}.${this.hash}` }
    get query() { return `${this.tag}[${this.hash}]` }

    set parent(value: Cell) {
        this.#parent = value
        this.replace.from(value.replace)
    }
    get parent(): Cell {
        return this.#parent
    }
    set worker(value: CellWorker) {
        value.query = this.query
        value.owner = this
        this.#worker = value
    }
    get worker(): CellWorker { return this.#worker }

    set style(value: StyleObject | CellStyle) {
        if (value instanceof CellStyle) {
            value.query = this.query
            value.owner = this
            this.#style = value
        } else {
            this.#style = new CellStyle(this.query, value)
            this.#style.owner = this
        }
    }
    get style(): CellStyle { return this.#style }

    set attributes(value: CellAttributes | AttrRawType) {
        if (value instanceof CellAttributes) {
            this.#attributes = value
        } else {
            this.#attributes = new CellAttributes()
            this.#attributes.from(value)
        }
    }
    get attributes(): CellAttributes { return this.#attributes as CellAttributes }

    set replace(value: { [index: string]: string | number } | CellReplacements) {
        if (value instanceof CellReplacements) {
            this.#replace = value
        } else {
            this.#replace = new CellReplacements()
            this.#replace.from(value)
        }
    }
    get replace(): CellReplacements { return this.#replace.from(this.parent?.replace) }

    constructor(tag: string = 'div') {
        this.tag = tag
        this.attributes = new CellAttributes()
        this.replace = new CellReplacements()
        this.style = new CellStyle()
        this.worker = new CellWorker()
        this.attributes.set('$hash', this.hash)
    }
    set_render_options(options: CellRenderOptionsType = {}): Cell {
        this.#cell_render_options_type = { ...this.#cell_render_options_type, ...options }
        this.#replace.separator = this.#cell_render_options_type.replace_global_separator
        return this
    }
    render(options: CellRenderOptionsType = {}): string {
        this.set_render_options(options)
        const template: string[] = []
        template.push(`<${this.tag}${this.attributes.render()}>`)

        this.content.forEach(item => {
            template.push(item.render(this.#cell_render_options_type) as string)
        })
// !this.#cell_render_options_type.close && 
        if (!SINGLE_MARKS.includes(this.tag))
            template.push(`</${this.tag}>`)
        
        if (!this.#cell_render_options_type.no_script && !this.worker.empty())
            template.push(this.worker.generate().render({ no_script: true }))

        return template.join('')
    }
    ref(name: string): Cell {
        this.attributes.set('ref', name)
        return this
    }
    text(text: string | TxtType, location: CellLocation = CellLocation.End): Cell {
        const text_node = typeof text == 'string' ? txt(text) : text
        this.push(text_node, location)
        return this
    }
    cell(tag: string, location?: CellLocation): Cell {
        const cell = new Cell(tag)
        this.push(cell, location)
        return cell
    }
    clear_content(only_text: boolean = true): Cell {
        this.content.filter(item => only_text ? !(item instanceof txt) : false)
        return this
    }
    push(cell_component: Cell | TxtType, location: CellLocation = CellLocation.End): Cell {
        if (cell_component instanceof Cell) {
            if (location == CellLocation.Start || location == CellLocation.End)
                cell_component.parent = this
            if (location == CellLocation.After || location == CellLocation.Before)
                cell_component.parent = this.parent
        }

        if (location == CellLocation.Start) {
            this.content.splice(0, 0, cell_component)
        }
        else if (location == CellLocation.End) {
            this.content.push(cell_component)
        }
        else if (location == CellLocation.After && this.parent)
            this.parent.content.splice(this.parent.content.indexOf(this) + 1, 0, cell_component)
        else if (location == CellLocation.Before && this.parent)
            this.parent.content.splice(this.parent.content.indexOf(this), 0, cell_component)

        return this
    }
    /**
     * Represents a cell with a specific structure.
     * The structure is defined using the hivecraft_struct format.
     *
     * @typedef {string} struct - `:\<tag>#\<id>.\<class or classes>$\<ref> <text>`
     * @example
     * ':p#title.highlight$on_click Hello'
     * <p id="title" class="highlight" ref="on_click">Hello</p>
     * @example
     * ':a.highlight.red$separator Hivecraft'
     * <a class="highlight red" ref="separator">Hivecraft</a>
     * 
     * @param {string} struct - The hivecraft_struct format string.
     * @param {CellLocation} location - The location of the cell.
     * @returns {Cell} A Cell object.
     */
    add(struct: string, location?: CellLocation): Cell {
        const cell = new Cell('div')
        cell.meta_extractor(struct)
        this.push(cell, location)
        return cell
    }
    forEach(callback: (item: Cell | TxtType, index: number) => void, filter: ForEachFilter = {}, index: number = 0) {
        if (filter.self)
            callback(this, index)
        filter.self = true
        this.content.forEach(element => {
            if (element instanceof txt && (!filter?.only || filter?.only == 'text'))
                callback(element, index)

            if (element instanceof Cell && (!filter?.only || filter?.only == 'block'))
                if (!filter.tag || filter.tag.includes(element.tag))
                    element.forEach(callback, filter, index)
            index++
        })
    }
    find(callback: (item: Cell | TxtType, index: number) => boolean) {
        return this.content.find(callback)
    }
    copy(): Cell {
        const cell_copy = new Cell(this.tag)
        cell_copy.replace = this.replace.copy()
        cell_copy.attributes = this.attributes.copy()
        cell_copy.style = this.style.copy()
        cell_copy.worker = this.worker.copy()
        this.content.forEach((item) => {
            cell_copy.push(item.copy())
        })
        return cell_copy
    }
    private meta_extractor(hivecraft_struct: string) {
        const [meta, ...content] = hivecraft_struct.split(' ')
        this.tag = meta.match(meta_regex.tag)?.[0]
        this.attributes.set('id', meta.match(meta_regex.id)?.[0] || '')
        this.attributes.append('class', meta.match(meta_regex.class)?.join(' ') || '')
        this.attributes.set('ref', meta.match(meta_regex.ref)?.[0] || '')

        this.text(content.join(' '))
    }
}
