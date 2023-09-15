import { HivecraftForm, HivecraftTable } from "."

export type WrapperType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'b' | 's' | 'u' | 'i' | 'sup' | 'sub' | 'code' | 'span'
export type QueryType = string
export type HashType = string

export type AttrRawType = Record<string, string | number | null | boolean>

export type LibType = {
    local: string,
    pack: string,
    href: string,
    hash?: string,
    priority?: boolean,
    crossorigin?: string,
    referrerpolicy?: string,
    type?: 'script' | 'style'
}

export type ForEachFilter = {
    self?: boolean
    only?: 'block' | 'text'
    tag?: string[]
}
export type CallbackCog = {
    self: HTMLElement,
    item: { [index: string]: any },
    data: {
        proxy: { [index: string]: any },
        refs: { [index: string]: HTMLElement },
        params: { [index: string]: any },
    },
    ext: {
        table: { [index: string]: HivecraftTable },
        form: { [index: string]: HivecraftForm },
        imports: { [index: string]: any },
    }
}
export type WorkerCallback = (cog: CallbackCog) => void

export type CSSList = CSSStyleDeclaration

export type EventType = string

export interface Event {
    type: string,
    callback: (...arg: any[]) => void
}
export type StyleObject = CssObject & { imports?: string[], query?: QueryType, children?: StyleObject[] }

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
        start: string,
        end: string
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

export type CssObject = { [index in keyof CSSList]?: string | number }
