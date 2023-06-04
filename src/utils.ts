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

export const WORKER_NAME = 'CARBEE_WORKER'

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
        local: 'crypto',
        variable: 'CryptoJS',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
        hash: 'sha512-E8QSvWZ0eCLGk4km3hxSsNmGWbLtSCSUcewDQPQWZF6pEU8GlT8a5fF32wOl1i8ftdMhssTrF/OhyGWwonTcXA=='
    },
    {
        local: 'axios',
        variable: 'axios',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js',
        hash: 'sha512-uMtXmF28A2Ab/JJO2t/vYhlaa/3ahUOgj1Zf27M5rOo8/+fcTUVH0/E0ll68njmjrLqOBjXM3V9NiPFL5ywWPQ=='
    },
    // {
    //     local: 'CARBEE_WORKER',
    //     variable: 'CARBEE_WORKER',
    //     href: 'https://cdn.jsdelivr.net/gh/cnuebred/carbee-public-worker@8a320391dfcb87fa1236ec5899af188a19e9e7d3/pub.worker.js',
    //     hash: ''
    // },
    //--------------------------------------
    // {
    //     local: 'CARBEE_WORKER',
    //     variable: 'CARBEE_WORKER',
    //     href: 'pub.worker.js',
    //     hash: ''
    // },
]
