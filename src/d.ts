export type WrapperType = 'h1'| 'h2'| 'h3'| 'h4' | 'h5'| 'b' | 's' | 'u' | 'i' | 'sup' | 'sub' | 'code' | 'span'
export type QueryType = string
export type HashType = string

export type ForEachFilter = {
    only?: 'block' | 'text'
}

export type CSSList = CSSStyleDeclaration

export type EventType = 'click' | 'scroll' | 'blur' | 'hover'  

export interface Event {
    type: string,
    callback: (...arg: any[]) => void
}