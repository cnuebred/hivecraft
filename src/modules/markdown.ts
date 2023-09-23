const regex = {
    bold: {
        regex: /(?<!\\|\*)(\*\*)(.+?)(\1)/gm,
        tag: (_, _1, _2, _3) => `<b>${_2}</b>`
    },
    italic: {
        regex: /(?<!\\|\*)(\*)(.+?)(\1)/gm,
        tag: (_, _1, _2, _3) => `<i>${_2}</i>`
    },
    strike: {
        regex: /(?<!\\|\-)(\-\-)(.+?)(\1)/gm,
        tag: (_, _1, _2, _3) => `<s>${_2}</s>`
    },
    underline: {
        regex: /(?<!\\|\_)(\_\_)(.+?)(\1)/gm,
        tag: (_, _1, _2, _3) => `<u>${_2}</u>`
    },
    header: {
        regex: /(?<!\\)(#{1,6}) (.+)/gm,
        tag: (_, _1, _2, _3, parent_tag) => `</${parent_tag}><h${_1.length}>${_2}</h${_1.length}><${parent_tag}>`
    },
}
const cleaner = /(?<!\\)(\\)/gm
const br = /(?<!\\)(\n)/gm
const hr = /^(?<!\\)(\-{3,})/gm

export const hivecraft_markdown = (text: string, parent_tag: string): string => {
    Object.entries(regex).forEach(([key, value]) => {
        text = text.replaceAll(value.regex,
            (_, _1, _2, _3) => value.tag(_, _1, _2, _3, parent_tag)
        )
    })
    text = text.replaceAll(hr, `</${parent_tag}><hr><${parent_tag}>`)
    text = text.replaceAll(br, `<br>`)
    text = text.replaceAll(cleaner, '')
    return text
}