import { readFile } from "fs";
import { CSSList, QueryType } from "./d";
import { CellTree } from "./utils";
import { Cell } from "./cell";
import path from "path";

type CssObject = {[index in keyof CSSList]?: string}

const change_to_css_style = (key) => {
    return key.replaceAll(/([a-z])([A-Z])/gm, '$1-$2').toLowerCase()
  }

class CellStyleEntity {
    query: QueryType
    style: CssObject = {}
    constructor(query: QueryType, style: CssObject) {
        this.query = query
        this.style = style
    }
    render(){
        const list = Object.entries(this.style).map(([key, value]) => {
            return `${change_to_css_style(key)}: ${value}`
        })
        return `${this.query}{${list.join(';')}}`
    }
}

type StyleObject = {
    query?: QueryType,
    style: CssObject
}

export class CellStyle extends CellTree {
    imports: string[] = []
    styles: CellStyleEntity[] = []
    classes: string[] = []
    constructor() { super() }
    empty(): boolean{
        return this.styles.length == 0 && this.import.length == 0
    }
    join(){
        return this.styles.map(item => {return item.render()}).join(';')
    }
    generate(): Cell {
        const script = new Cell('style')
        const text = script.text(this.join())
        text.category = 'style'
        return script
    }
    import(value: string, dirname: string, url: boolean = false): CellTree {
        if(!url)
            value = path.join(dirname, value).replace(/\\/gm, '/')
        else
            value = `url(${value})`
        this.imports.push(value)
        return this
    }
    add(styleObject: StyleObject){
        const style_entity = new CellStyleEntity(`${this.query} ${styleObject.query || ''}`, styleObject.style)
        this.styles.push(style_entity)
    }
    class(...names: string[]){
        names.forEach(name => {
            this.owner.attributes.append('class', name)
            this.classes.push(name)
        })
    }
    copy(): CellStyle {
        const style_copy = new CellStyle()
        style_copy.styles = [...this.styles]
        style_copy.classes = [...this.classes]

        return style_copy
    }
}