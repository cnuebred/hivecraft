import { Cell } from "./cell"
import { CellRenderOptionsType, LibType, QueryType } from "./d"

export class CellTree{
    private _query: QueryType
    private _owner: Cell
    constructor(){}
    set query(value: QueryType) { this._query = value }
    get query() { return this._query }

    set owner(value: Cell) { this._owner = value }
    get owner() { return this._owner }
}

export const WORKER_NAME = 'HIVECRAFT_WORKER'

export const SINGLE_MARKS = ['br', 'input']

export const meta_regex = {
  tag: /(?<=\:)(?<tag>\w*)/gm,
  id: /((?<=\#)(?<id>\w*))/gm,
  class: /((?<=\.)(?<class>\w*))/gm,
  ref: /((?<=\$)(?<ref>\w*))/gm,
}

export const CellRenderOptionsDefault: CellRenderOptionsType = {
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
    {
        type: 'script',
        local: 'HIVECRAFT_WORKER',
        pack: 'HIVECRAFT_WORKER',
        href: 'https://cdn.jsdelivr.net/gh/cnuebred/hivecraft-public-worker@minify/pub/min/pub.worker.min.js',
        hash: ''
    },
]
