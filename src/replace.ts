export class CellReplacements {
    replacement: { [index: string]: string } = {}
    separator: string = ''
    filter(text: string): string {
        Object.entries(this.replacement).forEach(([key, value]) => {
            text = text.replaceAll(key, value)
        })
        return text
    }
    from(attributes: { [index: string]: string }): CellReplacements {
        this.replacement = { ...this.replacement, ...attributes }
        return this
    }
    set(key: string, value: string):CellReplacements{
        this.replacement = { ...this.replacement, ...{ [key]: value } }
        return this
    }
    copy(): CellReplacements {
        const replace_copy = new CellReplacements()
        replace_copy.from(this.replacement)
        return replace_copy
    }
}