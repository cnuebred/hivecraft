import { CSSList, QueryType } from "./d";
import { BrickTree } from "./utils";

type CssObject = {[index in keyof CSSList]?: string}

const change_to_css_style = (key) => {
    return key.replaceAll(/([a-z])([A-Z])/gm, '$1-$2').toLowerCase()
  }

class BrickStyleEntity {
    query: QueryType
    style: CssObject = {}
    constructor(query: QueryType, style: CssObject) {
        this.query = query
        this.style = style
    }
    render(){
        const list = Object.entries(this.style).map((key, value) => {
            return `${change_to_css_style(key)}: ${value}`
        })
        return `${this.query}{${list.join(';')}}`
    }
}

export class BrickStyle extends BrickTree {
    styles: BrickStyleEntity[] = []
    constructor() { super() }
    render(){
        const styles = this.styles.map(item => {return item.render()}).join(';')
    }
    add(gen_query:string, style:CssObject){
        const style_entity = new BrickStyleEntity(`${this.query} ${gen_query}`, style)

        this.styles.push(style_entity)
    }
    copy(): BrickStyle {
        const style_copy = new BrickStyle()
        style_copy.styles = [...this.styles]
        return style_copy
    }
}