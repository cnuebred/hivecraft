import { AttrRawType } from "./d"

export class CellAttributes {
    private attributes: AttrRawType = {}
    constructor(attributes: AttrRawType = {}) {
        this.attributes = attributes
    }
    render(): string {
        const attrs = Object.entries(this.attributes).map(([key, value]) => {
            if (key.startsWith('$')) return `${value}`
            if(!key || !value) return ''
            return `${key}="${value}"`
        }).join(' ')
        return attrs ? ` ${attrs}` : ''
    }
    append(key: string, value: string | number | null, separator:string = ' '): CellAttributes {
        if(value == '') return this
        this.attributes[key] = `${this.get(key) || ''}${separator}${value.toString()}`.trim()
        return this
    }
    set(key: string, value: string | number | null): CellAttributes {
        if(value == '') return this
        this.attributes = { ...this.attributes, ...{ [key]: value } }
        return this
    }
    from(attributes: { [index: string]: string | number | null | boolean}): CellAttributes {
        this.attributes = { ...this.attributes, ...attributes }
        return this
    }
    get(key: string): string | number | null | boolean {
        return this.attributes[key] || null
    }
    copy() {
        return new CellAttributes(this.attributes)
    }
}