import { randomBytes } from "crypto"
import { WrapperType } from "./d"
import { BrickWorker } from "./worker"



type BrickRenderOptionsType = {
    close?: boolean
    wrappers?: boolean
    replace?: boolean
    replace_global_separator?: {
        start?: string,
        end?: string
    }
}
const BrickRenderOptionsDefault: BrickRenderOptionsType = {
    wrappers: true, 
    replace: false,
    replace_global_separator: {
        start: '',
        end: ''
    }
}


export class BrickReplacements {
    replacement: { [index: string]: string } = {}
    separator: string = ''
    filter(text: string): string {
        Object.entries(this.replacement).forEach(([key, value]) => {
            text = text.replaceAll(key, value)
        })
        return text
    }
    set(key:string, value:string){
        this.replacement = {...this.replacement, ...{[key]: value}}
    }

}

class  BrickStyle {
constructor () {}

}
export class BrickAttributes {
    private attributes: { [index: string]: string | number | null } = {}
    constructor() { }
    render(): string {
        return Object.entries(this.attributes).map(([key, value]) => {
            if (!value)return `${key}`
            if(key.startsWith('$')) return `${value}`
            return `${key}="${value}"`
        }).join(' ')
    }
    push(key: string, value: string | number | null):BrickAttributes {
        this.attributes = { ...this.attributes, ...{ [key]: value } }
        return this
    }
    from(attributes: { [index: string]: string | number | null }):BrickAttributes {
        this.attributes = { ...this.attributes, ...attributes }
        return this
    }
    get(key:string): string | number | null {
        return this.attributes[key] || null 
    }
    copy(){
        return new BrickAttributes().from(this.attributes)
    }
}
export class BrickText {
    type: 'text'
    text: string
    replace: BrickReplacements
    public parent: Brick
    private wrapper: WrapperType[] = []
    
    constructor(text: string, replace?: BrickReplacements) {
        this.text = text
        this.replace = replace || new BrickReplacements()
    }
    render(options?: BrickRenderOptionsType): string {
        let text = this.text

        if(options.replace)
            text = this.replace.filter(this.text)
        
        if (options?.wrappers)
        return this.attach_wrappers(text)
        
        return text
    }
    wrap(...wraps: WrapperType[]): BrickText {
        this.wrapper = [...this.wrapper, ...wraps]
        return this
    }
    copy(): BrickText{
        const brick_text_copy = new BrickText(this.text)
        brick_text_copy.wrapper = this.wrapper
        brick_text_copy.replace = this.replace
        return brick_text_copy
    }
    private attach_wrappers(text): string {
        this.wrapper.map(item => {
            text = `<${item}>${text}</${item}>`
        })
        return text
    }
}
export class Brick {
    type: 'block'
    _hash: string = randomBytes(4).toString('hex')
    _content: (BrickText | Brick)[] = []
    _tag: string = 'div'
    public parent: Brick
    public style: BrickStyle
    public worker: BrickWorker
    public attributes: BrickAttributes

    set tag(value: string) { this._tag = value }
    get tag() { return this._tag }
    get hash() { return this._hash }
    get chain() { return `${this.parent.chain}.${this.hash}` }
    get query() { return `${this.tag}[${this.hash}]` }

    constructor(tag: string, attributes?: BrickAttributes, style?: BrickStyle,  worker?: BrickWorker) {
        this.tag = tag
        this.attributes = attributes || new BrickAttributes()
        this.style = style || new BrickStyle()
        this.worker = worker || new BrickWorker()
        this.attributes.push('$hash', this.hash)
    }
    render(options: BrickRenderOptionsType = {}): string {
        options = { ...BrickRenderOptionsDefault, ...options }

        const template = []
        template.push(`<${this.tag} ${this.attributes.render()}>`)

        this._content.forEach(item => {
            template.push(item.render(options))
        })

        template.push(`</${this.tag}>`)

        return template.join('')
    }
    text(text: string): BrickText {
        const text_node = new BrickText(text)
        this.push(text_node)
        return text_node
    }
    brick(tag: string, attributes?: BrickAttributes): Brick {
        const brick = new Brick(tag, attributes)
        this.push(brick)
        return brick
    }
    push(brick_component: Brick | BrickText): Brick{
        brick_component.parent = this
        this._content.push(brick_component)
        return this
    }
    copy(): Brick{
        const brick_copy = new Brick(this.tag, this.attributes.copy())
        brick_copy.style = this.style
        brick_copy.worker = this.worker
        this._content.forEach((item) => {
             brick_copy.push(item.copy())
        })
        return brick_copy
    }
}