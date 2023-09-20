import { Cell } from "./cell"
import { CellRenderOptionsType, LibType, QueryType } from "./d"

export class CellTree {
    #query: QueryType
    #owner: Cell
    constructor() { }
    set query(value: QueryType) { this.#query = value }
    get query() { return this.#query }

    set owner(value: Cell) { this.#owner = value }
    get owner() { return this.#owner }
}

export const WORKER_NAME = 'HIVECRAFT_WORKER'

//https://html.spec.whatwg.org/multipage/syntax.html#void-element
export const SINGLE_MARKS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']
export const STYLE_OBJ_FUNCTOR = ['imports', 'query', 'children']

export const meta_regex = {
    tag: /^(?<tag>\w*)/gm,
    id: /((?<=\#)(?<id>\w*))/gm,
    class: /((?<=\.)(?<class>\w*))/gm,
    ref: /((?<=\$)(?<ref>\w*))/gm,
}
export const BASE_QUERY_STYLE_SELECTOR_REPLACE = '@'

export const CELL_RENDER_OPTIONS_DEFAULT: CellRenderOptionsType = {
    markdown: true,
    wrappers: true,
    no_script: false,
    proxy: {
        start: '||',
    },
    replace: false,
    replace_global_separator: {
        start: '',
        end: ''
    }
}

export const IMPORT_LIBS_LIST: LibType[] = [
    {
        type: 'script',
        local: 'crypto',
        pack: 'CryptoJS',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
        hash: 'sha512-E8QSvWZ0eCLGk4km3hxSsNmGWbLtSCSUcewDQPQWZF6pEU8GlT8a5fF32wOl1i8ftdMhssTrF/OhyGWwonTcXA=='
    },
    {
        type: 'script',
        local: 'axios',
        pack: 'axios',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js',
        hash: 'sha512-uMtXmF28A2Ab/JJO2t/vYhlaa/3ahUOgj1Zf27M5rOo8/+fcTUVH0/E0ll68njmjrLqOBjXM3V9NiPFL5ywWPQ=='
    },
    // {
    //     type: 'script',
    //     local: 'HIVECRAFT_WORKER',
    //     pack: 'HIVECRAFT_WORKER',
    //     async: true,
    //     href: './cdn/cdn.min.js',//'https://cdn.jsdelivr.net/gh/cnuebred/hivecraft-public-worker@minify/pub/min/pub.worker.min.js',
    //     hash: ''
    // },
]
