import { render } from "sass";
import { StyleObject } from "./d";
import { CellTree, STYLE_OBJ_FUNCTOR } from "./utils";
import path from "path";


const change_to_css_style = (key) => {
    return key.replaceAll(/([a-z])([A-Z])/gm, '$1-$2').toLowerCase()
}


export class CellStyle extends CellTree {
    imports_list: { source: string, render: string, url: boolean }[] = []
    css: StyleObject = {}
    constructor(query?: string, css?: StyleObject) {
        super()
        if (query) this.query = query
        if (css) this.from({ ...css })
    }
    empty(): boolean {
        for (let key in this.css) {
            if (this.css.hasOwnProperty(key)) {
                return false;
            }
        }
        return true && this.imports_list.length == 0;
    }
    push_children(...csss: StyleObject[]) {
        if (this.css.children)
            this.css.children.push(...csss)
        else
            this.css.children = csss
    }
    parser(query: string, csss: StyleObject[]): string {
        let single_css = ''

        csss.forEach(css => {
            const local_query = css.query ? `${query}${css.query.startsWith(':') ? '' : ' '}${css.query}` : query
            const style_properties = Object.entries(css)
                .map(([key, value]) => {
                    if (STYLE_OBJ_FUNCTOR.includes(key)) return null
                    return `${change_to_css_style(key)}:${value};`
                })
                .filter(item => !!item).join('')
            single_css += `${local_query} {${style_properties}} `
            if (css.children) single_css += this.parser(local_query, css.children)
        })

        return single_css
    }
    render(): string {
        return this.parser(this.query, [this.css])
    }
    push_import(value: string): CellTree {
        const is_url = value.match(/http|https/gm)
        let render_value: string = ''
        if (!is_url)
                {
                    const caller = path.parse('/' +(new Error()).stack.split("\n")[2].split(path.sep).slice(1)
                    .join(path.sep).split(":")[0])
                    render_value = path.join(caller.dir, value)
                }
        else
            render_value = `url("${value}")`
        this.imports_list.push({ source: value, render: render_value, url: !!is_url })
        return this
    }
    from(style: StyleObject) {
        if (style) this.css = JSON.parse(JSON.stringify(style))
        if (style && style.imports) style.imports.forEach(item => this.push_import(item))
    }
    copy(): CellStyle {
        const style_copy = new CellStyle()
        style_copy.css = JSON.parse(JSON.stringify(this.css))
        style_copy.imports_list = [...this.imports_list]
        return style_copy
    }
}