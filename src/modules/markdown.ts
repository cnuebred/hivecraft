const regex = {
    italic: {
        regex: /(?<!\\|\*)(\*)(.+)(\1)/gm,
        tag: () => 'i'
    },
    bold: {
        regex: /(?<!\\|\*)(\*\*)(.+)(\1)/gm,
        tag: () => 'b'
    },
    strike: {
        regex: /(?<!\\|\-)(\-\-)(.+)(\1)/gm,
        tag: () => 's'
    },
    underline: {
        regex: /(?<!\\|\_)(\_\_)(.+)(\1)/gm,
        tag: () => 'u'
    },
    header: {
        regex: /(?<!\\)(#{1,6}) (.+)/gm,
        tag: (tagger) => `h${tagger.length}`
    },
}
const cleaner = /(?<!\\)(\\)/gm

export const hivecraft_markdown = (text: string): string => {
    Object.entries(regex).forEach(([key, value]) => {
        text = text.replaceAll(value.regex,
            (_, _1, _2, _3) => {
                return `<${value.tag(_1)}>${_2}</${value.tag(_1)}>`
            })
    })
    text = text.replaceAll(cleaner, '')
    return text
}