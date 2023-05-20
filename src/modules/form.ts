import { Cell } from "../cell";
import { CellLocation } from "../d";

export type ConfigBox = {
    label: (name: string, label: string) => ConfigBox
    placeholder: (placeholder: string) => ConfigBox
    value: (value: string) => ConfigBox
}

export class Form extends Cell {
    form_name:string
    constructor(name:string) {
        super('div')
        this.form_name = name
        this.attributes.set('form', name)
    }
    config_box = (input: Cell): ConfigBox => {
        return {
            label: (name: string, label?: string) => this.label(input, name, label),
            placeholder: (placeholder: string) => this.placeholder(input, placeholder),
            value: (value: string) => this.value(input, value)
        }
    }
    private value(input: Cell, value: string): ConfigBox {
        input.attributes.set('value', value)
        return this.config_box(input)
    }
    private placeholder(input: Cell, placeholder: string): ConfigBox {
        input.attributes.set('placeholder', placeholder)
        return this.config_box(input)
    }
    private label(input: Cell, name: string, label?: string): ConfigBox {
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

    add(type: string) {
        const input = new Cell('input')
        input.attributes.set('type', type)
        input.attributes.set('data-input', null)
        this.push(input)

        return this.config_box(input)
    }

}