type AttrType = { [index: string]: string | number | null | boolean }
export class CellAttributes {
    private attributes: AttrType = {}
    constructor() {}
    render(): string {
        return Object.entries(this.attributes).map(([key, value]) => {
            if (!value) return `${key}`
            if (key.startsWith('$')) return `${value}`
            return `${key}="${value}"`
        }).join(' ')
    }
    append(key: string, value: string | number | null): CellAttributes {
        this.attributes[key] = `${this.get(key) || ''} ${value.toString()}`.trim()
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
        return new CellAttributes().from(this.attributes)
    }
}