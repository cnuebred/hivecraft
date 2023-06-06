export class CellReplacements {
    replacement: { [index: string]: string | number} = {}
    separator: string = ''
    filter(text: string): string {
        Object.entries(this.replacement).forEach(([key, value]) => {
            text = text.replaceAll(key, value.toString())
        })
        return text
    }
    from(attributes: { [index: string]: string | number}): CellReplacements {
        this.replacement = { ...this.replacement, ...attributes }
        return this
    }
    set(key: string, value: string):CellReplacements{
        this.replacement = { ...this.replacement, ...{ [key]: value } }
        return this
    }
    copy(): CellReplacements {
        const replace_copy = new CellReplacements()
        replace_copy.separator = this.separator
        replace_copy.from(this.replacement)
        return replace_copy
    }
}