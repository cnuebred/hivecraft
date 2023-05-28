import { Cell } from "../cell";
import { CellLocation } from "../d";

export type FormConfigBox = {
    label: (name: string, label?: string) => FormConfigBox
    placeholder: (placeholder: string) => FormConfigBox
    value: (value: string) => FormConfigBox
    br: () => FormConfigBox
    proxy: (ref:string) => FormConfigBox,
    oninput: (foo_name:string, foo: () => void) => FormConfigBox
}

export class Form extends Cell {
    form_name: string
    constructor(name:string) {
        super('div')
        this.form_name = name
        this.attributes.set('form', name)
    }
    config_box = (input: Cell): FormConfigBox => {
        return {
            label: (name: string, label?: string) => this.label(input, name, label),
            placeholder: (placeholder: string) => this.placeholder(input, placeholder),
            value: (value: string) => this.value(input, value),
            br: () => {this.push(new Cell('br')); return this.config_box(input)},
            proxy: (ref:string) => this.proxy(input, ref),
            oninput: (foo_name:string, foo: () => void) => this.oninput(input, foo_name, foo)
            
        }
    }
    private value(input: Cell, value: string): FormConfigBox {
        input.attributes.set('value', value)
        return this.config_box(input)
    }
    private placeholder(input: Cell, placeholder: string): FormConfigBox {
        input.attributes.set('placeholder', placeholder)
        return this.config_box(input)
    }
    private label(input: Cell, name: string, label?: string): FormConfigBox {
        name = name.replaceAll(' ', '_')
        if (label) {
            const label_element = new Cell('label')
            label_element.text(label)
            label_element.attributes.set('name', name)
            input.push(label_element, CellLocation.Before)
        }
        input.attributes.set('name', name)
        return this.config_box(input)
    }
    private proxy(input:Cell, ref: string){
        input.attributes.set('input-proxy', ref)
        return this.config_box(input)
    }
    private oninput(input:Cell, foo_name, foo: () => void){
        input.attributes.set('@input', foo_name)
        input.worker.add('input').event(foo)
        return this.config_box(input)
    }
    input(type: string) {
        const input = new Cell('input')
        input.attributes.set('type', type)
        input.attributes.set('data-input', null)
        this.push(input)

        return this.config_box(input)
    }

}