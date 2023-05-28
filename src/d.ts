export type WrapperType = 'h1'| 'h2'| 'h3'| 'h4' | 'h5'| 'b' | 's' | 'u' | 'i' | 'sup' | 'sub' | 'code' | 'span'
export type QueryType = string
export type HashType = string

export type LibType = {
    local: string,
    variable: string,
    href: string,
    hash?: string,
    priority?: boolean
}

export type ForEachFilter = {
    only?: 'block' | 'text'
}

export type CSSList = CSSStyleDeclaration

export type EventType = string

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

export type CoreHtmlConfigRender = {
    to_file?: string
} & CellRenderOptionsType

export type CorePdfConfigRender = {} & CoreHtmlConfigRender

export enum CellLocation {
    Start,
    End,
    Before,
    After
}
