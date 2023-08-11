import { CellAttributes } from "./attributes"
import { Cell } from "./cell"
import { AttrRawType, CellRenderOptionsType, WrapperType } from "./d"
import { CellReplacements } from "./replace"

export const txt = (_text: string) => ({
    map: (callback: (_text: string) => string) => txt(callback(_text)),
    replace: (replace: string, new_text: string) => txt(_text.replaceAll(replace, new_text)),
    wrap: (tag: string, attributes: AttrRawType = {}) => txt(`<${tag}${CellAttributes.parser(attributes)}>${_text}</${tag}>`),
    /**
     * @todo
     * regexp change to custom separators
     */
    proxy: () => {
        return txt(
            _text.replaceAll(new RegExp(`\\[\([\\w.]+\)\\]`, 'gm'), (match, _1) => `<span proxy_data="${_1}"></span>`)
        )
    },
    render: () => _text,
    copy: () => txt(_text)
})
export type TxtType = ReturnType<typeof txt>