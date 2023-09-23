import { Cell } from "../cell";
import { AttrRawType, WorkerCallback, CellLocation, CellRenderOptionsType } from "../d";

export type GroupFormOptions = {
    default_br?: boolean
    label_position?: 'before' | 'after',
    label_default_br?: boolean
}
export type FormConfigBox = {
    label: (label?: string) => FormConfigBox
    placeholder: (placeholder?: string) => FormConfigBox
    value: (value: string) => FormConfigBox
    br: () => FormConfigBox
    proxy: (ref: string) => FormConfigBox,
    oninput: (foo_name: string, foo: WorkerCallback) => FormConfigBox,
    on: (event: string, foo: WorkerCallback) => FormConfigBox,
    input: (name: string, type?: string) => FormConfigBox
    attr: (attributes: AttrRawType) => FormConfigBox,
    commit: () => Cell

}

const TYPE_AS_TAG = ['textarea']

export class Form {
    #form: Cell
    form_name: string
    constructor(name: string) {
        this.#form = new Cell('div')

        if (name.match(/([\W\d])/))
            throw new Error('Name of form cannot include symbols and digits')

        this.form_name = name
        this.#form.attributes.set('data-form', name)
    }
    get form(): Cell {
        return this.#form
    }
    private configbox = (input: Cell): FormConfigBox => {
        return {
            label: (label?: string) => this.label(input, label),
            placeholder: (placeholder?: string) => this.placeholder(input, placeholder),
            value: (value: string) => this.set_value(input, value),
            br: () => this.br(input),
            proxy: (ref: string) => this.proxy(input, ref),
            oninput: (foo_name: string, foo: WorkerCallback) => this.oninput(input, foo_name, foo),
            on: (event: string, foo: WorkerCallback) => this.on(input, event, foo),
            input: (name: string, type: string = 'text') => this.input(name, type),
            attr: (attributes: AttrRawType) => this.attr(input, attributes),
            commit: () => this.form
        }
    }
    private br(input: Cell): FormConfigBox {
        this.#form.push(new Cell('br'))
        return this.configbox(input)
    }
    private attr(input: Cell, attributes: AttrRawType){
        if (attributes) input.attributes.from(attributes)
        return this.configbox(input)
    }
    private set_value(input: Cell, value: string): FormConfigBox {
        input.attributes.set('value', value)
        return this.configbox(input)
    }
    private placeholder(input: Cell, placeholder: string): FormConfigBox {
        if(!placeholder) placeholder = input.attributes.get('name').toString()
        input.attributes.set('placeholder', placeholder)
        return this.configbox(input)
    }
    private label(input: Cell, label?: string): FormConfigBox {
        const label_element = new Cell('label')
        if(!label) label = input.attributes.get('name').toString()
        label_element.text(label)
        label_element.attributes.set('name', input.attributes.get('name').toString())
        input.push(label_element, CellLocation.Before)
        return this.configbox(input)
    }
    private proxy(input: Cell, ref: string) {
        input.attributes.set('input-proxy', ref)
        return this.configbox(input)
    }
    private oninput(input: Cell, foo_name: string, foo: WorkerCallback) {
        input.attributes.set('@input', foo_name)
        input.worker.event('input', foo)
        return this.configbox(input)
    }
    private on(input: Cell, event: string, foo: WorkerCallback) {
        input.worker.event(event, foo)
        return this.configbox(input)
    }
    private groupconfigbox = (group: Cell, name: string, type: string, last?: Cell, options: GroupFormOptions = {}) => {
        return {
            option: (
                label: string,
                position: 'before' | 'after' = options.label_position || 'before',
                with_br: boolean = options.label_default_br || false
            ) => {
                const label_hide = label.replaceAll(' ', '_').toLocaleLowerCase()
                const cell = group.cell('input')
                const id = `${cell.hash}${label_hide}_${name}_${type}`.toLowerCase()

                cell.attributes.set('type', type)
                cell.attributes.set('$data-input', 'data-input')
                cell.attributes.set('id', id)
                cell.attributes.set('name', name)
                cell.attributes.set('value', label)

                const label_element = new Cell('label')
                label_element.text(label)
                label_element.attributes.set('for', id)

                if (position == 'before') {
                    cell.push(label_element, CellLocation.Before)
                    if (with_br) cell.push(new Cell('br'), CellLocation.Before)
                } else {
                    if (with_br) cell.push(new Cell('br'), CellLocation.After)
                    cell.push(label_element, CellLocation.After)
                }

                if (options?.default_br)
                    group.cell('br')
                
                return this.groupconfigbox(group, name, type, cell, options)
            },
            br: () => {
                group.cell('br')
                return this.groupconfigbox(group, name, type, last, options)
            },
            checked: () => {
                if (last) last.attributes.set('$', 'checked')
                return this.groupconfigbox(group, name, type, last, options)
            },
            attr: (attributes: AttrRawType) => {
                if (attributes) last.attributes.from(attributes)
                return this.groupconfigbox(group, name, type, last, options)
            },
            custom: () => last,
            commit: () => this.form
        }
    }
    group(name: string, type: string, options?: GroupFormOptions) {
        name = name.replaceAll(' ', '_').toLocaleLowerCase()

        const group = this.#form.cell('div')
        group.attributes.set('input-group', name)
        return this.groupconfigbox(group, name, type, null, options)
    }
    input(name: string, type: string = 'text') {
        name = name.replaceAll(' ', '_')

        const input = new Cell(TYPE_AS_TAG.includes(type) ? type : 'input')
        input.attributes.set('type', type)
        input.attributes.set('$data-input', 'data-input')
        input.attributes.set('name', name)

        this.#form.push(input)
        return this.configbox(input)
    }
    render(options: CellRenderOptionsType = {}): string {
        return this.#form.render(options)
    }
}