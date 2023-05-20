export type WrapperType = 'h1'| 'h2'| 'h3'| 'h4' | 'h5'| 'b' | 's' | 'u' | 'i' | 'sup' | 'sub' | 'code' | 'span'
export type QueryType = string
export type HashType = string

export const PATHS = {
    worker: './src/scripts/pub.worker.ts',
    local_worker: './pub.worker',
    my_worker: './src/scripts/my.worker.ts',
    bundle_worker: './src/scripts/build/my.worker.js',
    style: './src/scripts/pub.style.scss',
    local_style: './scripts/pub.style.scss',
    my_style: './src/scripts/my.style.scss',
    bundle_style: './src/scripts/build/my.style.css'
}

export const WORKER_NAME = 'CARBEE_WORKER'

export type LibType = {
    local: string,
    variable: string,
    href: string,
    hash: string
}

export type ForEachFilter = {
    only?: 'block' | 'text'
}

export type CSSList = CSSStyleDeclaration

export const meta_regex = {
  tag: /(?<=\:)(?<tag>\w*)/gm,
  id: /((?<=\#)(?<id>\w*))/gm,
  class: /((?<=\.)(?<class>\w*))/gm,
  ref: /((?<=\$)(?<ref>\w*))/gm,
}

export type EventType = 'click' | 'scroll' | 'blur' | 'hover'  

export interface Event {
    type: string,
    callback: (...arg: any[]) => void
}

export type CellRenderOptionsType = {
    close?: boolean
    no_script?: boolean
    proxy?: {
        start: string,
        end?: string,
    }
    wrappers?: boolean
    replace?: boolean
    replace_global_separator?: {
        start?: string,
        end?: string
    }
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

export type CoreHtmlConfigRender = {
    to_file?: string
} & CellRenderOptionsType
export type CorePdfConfigRender = {} & CoreHtmlConfigRender

export const IMPORT_LIBS_LIST: LibType[] = [
    {
        local: 'crypto',
        variable: 'CryptoJS',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
        hash: 'sha512-E8QSvWZ0eCLGk4km3hxSsNmGWbLtSCSUcewDQPQWZF6pEU8GlT8a5fF32wOl1i8ftdMhssTrF/OhyGWwonTcXA=='
    }
]

export enum CellLocation {
    Start,
    End,
    Before,
    After
}