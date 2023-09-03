import path from 'path';
import { CellStyle } from '../src/style';
import { StyleObject } from '../src/d';

describe('Style module tests - basic', () => {
    let style: CellStyle
    const style_css: StyleObject = {
        color: 'red',
        top: '30%',
        children: [
            {
                query: 'p',
                color: 'blue'
            },
            {
                query: ':hover',
                opacity: 0.3
            }
        ]
    }
    beforeAll(() => {
        style = new CellStyle('div.foo', style_css)
    })
    test('init basic style', () => {
        expect(style.css).toStrictEqual(style_css)
    })
    test('empty style condition', () => {
        const style = new CellStyle('div.foo', {})
        expect(style.empty()).toStrictEqual(true)
    })
    test('render style to css', () => {
        expect(style.render()).toBe(`div.foo {color:red;top:30%;} div.foo p {color:blue;} div.foo:hover {opacity:0.3;} `)
    })
    test('push child to object', () => {
        const third_child = {
            query: 'span',
            color: 'black'
        }
        style.push_children(third_child)
        console.log([...(style_css.children as StyleObject[]), third_child]
        )
        expect(style.css.children).toStrictEqual([...(style_css.children as StyleObject[]), third_child])
    })
})

describe('Style module tests - imports', () => {
    let style: CellStyle
    const style_css: StyleObject = {
        imports: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css'],
        color: 'red',
        top: '30%'
    }
    beforeAll(() => {
        style = new CellStyle()
        style.from(style_css)
    })
    test('init imports', () => {
        expect(style.imports_list).toStrictEqual([
            {
                source: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css',
                render: 'url(\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css\")',
                url: true
            }
        ])
    })
    test('add imports', () => {
        style.push_import('./style.css')
        expect(style.imports_list).toStrictEqual([
            {
                source: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css',
                render: 'url(\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css\")',
                url: true
            },
            {
                source: './style.css',
                render: path.resolve('./style.css'),
                url: false
            }
        ])
    })
})