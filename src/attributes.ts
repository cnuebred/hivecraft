import { AttrRawType } from "./d"
import { PROXY_REGEX } from "./utils"


export class CellAttributes {
    private attributes: AttrRawType = {}
    constructor(attributes: AttrRawType = {}) {
        this.attributes = attributes
    }
    static parser(attributes: AttrRawType) {
        const proxy_state = []
        const attrs = Object.entries(attributes).map(([key, value], index, arr) => {
            if (key == null || value == null) return ''
            const proxy_regex = value.toString().matchAll(new RegExp(PROXY_REGEX, 'g'))
            for(const proxy of proxy_regex){
                proxy_state.push(`${key}:${proxy[1]}`)
            }

            if (key.startsWith('$')) return `${value}`
            return `${key}="${value}"`
        }).join(' ')
        return attrs ? ` ${attrs}${
            proxy_state.length != 0 ? CellAttributes.parser({proxy_attr: proxy_state.join(' ')}) : ''
        }` : ''
    }
    render(): string {
        return CellAttributes.parser(this.attributes)
    }
    append(key: string, value: string | number | null, separator: string = ' '): CellAttributes {
        if (value == '') return this
        this.attributes[key] = `${this.get(key) || ''}${separator}${value.toString()}`.trim()
        return this
    }
    set(key: string, value: string | number | null): CellAttributes {
        if (value == '') return this
        this.attributes = { ...this.attributes, ...{ [key]: value } }
        return this
    }
    from(attributes: { [index: string]: string | number | null | boolean }): CellAttributes {
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