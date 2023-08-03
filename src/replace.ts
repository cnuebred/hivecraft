export class CellReplacements {
    replacement: { [index: string]: string | number } = {}
    separator: {
        start: string,
        end: string
    } = { start: '', end: '' }
    filter(text: string, separator = this.separator): string {
        Object.entries(this.replacement).forEach(([key, value]) => {
            text = text.replaceAll(`${separator?.start || ''}${key}${separator?.end || ''}`, value.toString())
        })
        return text
    }
    from(attributes: { [index: string]: string | number } | CellReplacements = {}, priority = true): CellReplacements {
        if (attributes instanceof CellReplacements)
            attributes = attributes.replacement

        if (priority)
            this.replacement = { ...this.replacement, ...attributes }
        else
            this.replacement = { ...attributes, ...this.replacement }
        return this
    }
    set(key: string, value: string): CellReplacements {
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