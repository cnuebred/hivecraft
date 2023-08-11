import { txt } from '../src/text'

describe('Text cell test', () => {
    const sample_text = txt('Hello Hivecraft')
    test('creating basic', () => {
        expect(sample_text.render()).toBe('Hello Hivecraft')
    })
    test('add wrapper - bold', () => {
        expect(sample_text.wrap('b').render())
            .toBe('<b>Hello Hivecraft</b>')
    })
    test('add wrapper - underline; add attribute class', () => {
        expect(sample_text.wrap('b').wrap('u', { class: 'change_pointer' }).render())
            .toBe('<u class="change_pointer"><b>Hello Hivecraft</b></u>')
    })
    test('map text - replace fn', () => {
        expect(sample_text.map(item => item.replace('Hello', 'Hi')).wrap('i').render())
            .toBe('<i>Hi Hivecraft</i>')
    })
    test('replace text', () => {
        expect(sample_text.replace('Hello', 'Hi').render())
            .toBe('Hi Hivecraft')
    })
    test('proxy setter 1', () => {
        expect(txt('Hello [name]').proxy().render())
            .toBe('Hello <span proxy_data="name"></span>')
    })
    test('proxy setter 2', () => {
        expect(txt('Hello [name], Here is Hivecraft').proxy().render())
            .toBe('Hello <span proxy_data="name"></span>, Here is Hivecraft')
    })
})