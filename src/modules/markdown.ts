import { convertToObject } from "typescript";
import { Cell } from "../cell";
import { CellRenderOptionsType } from "../d";

const regex = {
    block: {
        code_block: /(?<tag>(?<!\\)\`\`\`\s)(?<content>[\s\S]+?)((?<!\\)\`\`\`)/gm,
        blockquote_block: /(?<tag>(?<!\\)>>\s)(?<content>[\s\S]+?)(\n\n|(?=^((?<!\\)\<\<|\>|\`{3})))/gm,
        blockquote: /(?<tag>(?<!\\|>)>\s)(?<content>[\s\S]+?)(\n\n|(?=^(\<\<|\>|\`{3})))/gm,
        header: /(?<tag>(?<!\\)#{1,6})\s(?<content>[\s\S]+?)(\n\n|\1|(?=^(\#|\>|\`{1,3})))/gm,
    },
    style: {
        bold: /\*\*(?<content>[^\*]+)\*\*/gm,
        strice: /\-\-(?<content>[^\*]+)\-\-/gm,
        underline: /\_\_(?<content>[^\*]+)\_\_/gm,
        italic: /\*(?<content>[^\*]+)\*/gm,
        link: /\[(?<text>[^\]]+)\]\((?<url>[^\)]+)\)/gm
    }
}

export const text_array_spliter = (text: string, splitter: string) => {
    const start = text.indexOf(splitter)
    if (start == -1) return [text]
    const end = start + splitter.length
    // console.log([text.slice(0, start), text.slice(start, end), text.slice(end)].filter(item => !!item))
    return [text.slice(0, start), text.slice(start, end), text.slice(end)].filter(item => !!item)
}

const regex_react = {
    header: (match: RegExpMatchArray) => {
        return { tag: [`h${match.groups.tag.length}`], content: match.groups.content.trim(), all: match[0] }
    },
    blockquote_block: (match) => {
        return { tag: [`blockquote`], content: match.groups.content, all: match[0] }
    },
    blockquote: (match) => {
        return { tag: [`blockquote`], content: match.groups.content, all: match[0] }
    },
    code_block: (match) => {
        return { tag: [`code`], content: match.groups.content, all: match[0] }
    },
}

export type MarkdownElement = { tag: string, content: string, all: string, children?: MarkdownElement[] }

export class Markdown extends Cell {
    markdown: string = ''
    parts: string[] = []
    elements: [number, MarkdownElement][] = []
    constructor(markdown: string) {
        super()
        this.markdown = markdown
        // this.parts = this.markdown.split('\n\n')
        const blocks = this.#pre_parser_block(this.markdown)
        console.log(JSON.stringify(blocks))
        //blocks.forEach(item => this.#pre_parser_style(item))
        // console.log('========')
        // this.elements.forEach(item => this.#pre_parser_style(item))
        // this.elements.forEach(item => console.log(item.render()))
        // console.log('========')
    }
    #pre_parser_block(md: string) {
        const lines = md.split('\n')

        const regex_tmp = {
            blockquote: /(?<tag>(?<!\\|>)>)(?=\s)/gm,
            header: /(?<tag>(?<!\\|#)#{1,6})(?=\s)/gm
        }
        const regex_tmp_react = {
            blockquote: (value) => ({ tag: value.length == 1 ? ['blockquote'] : ['blockquote', 'pre'] }),
            header: (value) => ({ tag: [`h${value[0].length}`] })
        }
        const blocks = ['blockquote']

        let wrapper: string[] = []
        const elements = []
        const iter_tool = { prev: null, next: null }
        lines.forEach((item, index, arr) => {
            if (arr[index - 1]) iter_tool.prev = arr[index - 1]
            if (arr[index + 1]) iter_tool.next = arr[index + 1]
            let found_regex = false
            Object.entries(regex_tmp).forEach(([key, value]) => {
                if (item.match(value)) {
                    found_regex = true
                    // console.log(key, value, item.match(value))
                    wrapper = []
                    const { tag } = regex_tmp_react[key](item.match(value))
                    console.log(tag, item)
                    item = item.replace(value, '')
                    wrapper.push(tag)
                    elements.push(
                        {
                            tag: [...wrapper],
                            content: item
                        }
                    )
                }
            })
            if (!found_regex) {
                if (iter_tool.prev == '\n') elements.push({ tag: wrapper.length == 0 ? ['p'] : [...wrapper], content: item })
                else elements.push({ tag: [...wrapper], content: item })
            }

        })
        console.log(elements)


        //     const elements = []
        //     Object.entries(regex.block).forEach(([key, value]) => {
        //         // console.log(key, value)
        //         const matchs = md.matchAll(value)
        //         for (const match of matchs) {
        //             const item = regex_react[key](match)
        //             elements.push([match.index, item])
        //         } // nest elements; milti blockqoute; ad style regex
        //     })
        //     if(elements.length == 0) return null
        //     const elements_sort = elements.sort((a, b) => a[0] - b[0])
        //     const filter = elements_sort.filter((item, index, arr) => {
        //         if(index == 0) return true
        //         const [prev_index, prev_item] = arr[index - 1]

        //         if(prev_index + prev_item.content.length > item[0]){
        //             arr[index - 1][1].children = this.#pre_parser_block(prev_item.content)
        //         return false
        //     }
        //     return true
        // })
        //     let last_pos = 0
        //     const tmp_add_filter = []
        //     filter.forEach(item => {
        //         const current_pos = item[0] 
        //         const text = md.slice(last_pos-1, current_pos-1)
        //         // console.log(current_pos, last_pos, text)
        //         if(text.trim() == '') {
        //             last_pos = current_pos + item[1].all.length
        //             return
        //         }
        //         else tmp_add_filter.push(
        //             [current_pos - item[1].all.length, {tag: ['p'], content: text.trim(), all: text, children: null}]
        //         )
        //         last_pos = current_pos + item[1].all.length
        //     })
        //     const filter_all = [...filter, ...tmp_add_filter].sort((a, b) => a[0] - b[0])


        //     // filter_all.forEach(item => {

        //     // })
        //     return filter_all
    }
    #pre_parser_style(pack) {
        const [index, item] = pack
        if (item.tag.includes('code')) return
        console.log(item)
        const style = []
        Object.entries(regex.style).forEach(([key, value]) => {
            // console.log(key, value)
            const matchs = item.content.matchAll(value)
            for (const match of matchs) {
                style.push([match.index, regex_react[key](match)])
            } // nest elements; milti blockqoute; ad style regex
        })
        console.log(style)
    }
}



export type MarkdownEntity = {
    tag: string
    content: MarkdownEntity[]
}

export const markdown2json = (md: string) => {
    const lines = md.split('\n')

    const regex_tmp = {
        blockquote: /^\s*?(?<!\\|\>)\>\s/gm,
        header: /^\s*?(?<!\\|#)\#{1,6}\s/gm
    }
    const regex_tmp_react = {
        blockquote: (value) => ({ tag: value.length == 1 ? ['blockquote'] : ['blockquote', 'pre'] }),
        header: (value) => ({ tag: [`h${value[0].length}`] })
    }
    const blocks = ['blockquote']

    let wrappers: string[] = []
    const iter_tool = { prev: null, next: null }
    const least_element = { tag: [''], content: '' }
    let apply = false
    const elements = lines.map((item, index, arr) => {
        if (arr[index - 1]) iter_tool.prev = arr[index - 1]
        if (arr[index + 1]) iter_tool.next = arr[index + 1]
        const md_item = {raw: item, wrapper: [], content: ''}        

        if(item == '' && !wrappers.includes('code'))
            wrappers = []

        if(item.match(regex_tmp.blockquote)){
            wrappers = []
            wrappers.push(`blockquote`)
            md_item.wrapper = [...wrappers]
            md_item.content = item.replace(regex_tmp.blockquote, '')
        }
        
        if(item.match(regex_tmp.header)){
            wrappers = []
            const length = item.match(regex_tmp.header)[0].length - 1
            wrappers.push(`h${length}`)
            md_item.wrapper = [...wrappers]
            md_item.content = item.replace(regex_tmp.header, '')
        }



        // console.log({ item }, apply)

        // if (item.match(/^\s*?(?<!\\|\>)`{3}/gm)) {
        //     if (wrappers.includes('code')) {
        //         wrappers = []
        //         return
        //     }
        //     wrappers = []
        //     wrappers.push('code', 'pre')
        //     const text = item.replace(/^\s*?(?<!\\|\>)`{3}/gm, '')
        //     apply = true
        //     elements.push({ tag: [...wrappers], content: text })
        // }
        // else if(item.match(/^\s*?(?<!\\|\>)\>\>(?=\s)/gm))
        //     {
        //         wrapper = []
        //         wrapper.push('blockquote', 'pre')
        //         const text = item.replace(/^\s*?(?<!\\|\>)\>\>(?=\s)/gm, '')
        //         apply = true
        //         elements.push({tag: [...wrapper], content: text})
        //     }
    //     else if (item.match(/^\s*?(?<!\\|\>)\>\s/gm)) {
    //         wrappers = []
    //         wrappers.push('blockquote')
    //         const text = item.replace(/^\s*?(?<!\\|>)>/gm, '')
    //         apply = true
    //         elements.push({ tag: [...wrappers], content: text })
    //     }
    //     else if (item.match(/^\s*?(?<!\\|>)\#{1,6}(?=\s)/gm)) {
    //         wrappers = []
    //         wrappers.push('h' + item.match(/^\s*?(?<!\\|#)\#{1,6}(?=\s)/gm)[0].length)
    //         const text = item.replace(/^\s*?(?<!\\|#)\#{1,6}(?=\s)/gm, '')
    //         apply = true
    //         elements.push({ tag: [...wrappers], content: text })
    //     }
    //     else
    //         if (elements[elements.length - 1] && apply)
    //             elements[elements.length - 1].content += '\n' + item
    return md_item
    })
    console.log(elements)
}