export type WrapperType = 'h1'| 'h2'| 'h3'| 'h4' | 'h5'| 'b' | 's' | 'u' | 'i' | 'sup' | 'sub' | 'code' | 'span'
export type QueryType = string
export type HashType = string

export type EventType = '' 

export interface Event {
    type: string,
    callback: (...arg: any[]) => void
}