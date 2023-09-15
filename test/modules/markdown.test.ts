import {Markdown, text_array_spliter} from '../../src/modules/markdown'
const clear_regex = / ?v_[\s\S]{8}/gm

describe('Markdown module tests', () => {

    test('text_array_spliter', () => {
        const text = 'Hello world, **here** is me... Mario!!'
        expect(text_array_spliter(text, '**here**')).toStrictEqual([
            'Hello world, ',
            '**here**',
            ' is me... Mario!!'
        ])
        expect(text_array_spliter(text, 'Mario!!')).toStrictEqual([
            'Hello world, **here** is me... ',
            'Mario!!'
        ])
    })

    // test('Basic single tags', () => {
    //     for(let i = 1 ; i < 7; i++){
    //         expect(new Markdown(`${'#'.repeat(i)} Title h${i}`).render().replace(clear_regex, '')).toBe(`<div><h${i}>Title h${i}</h${i}></div>`)
    //     }
    //     expect(new Markdown(`#Here's a Heading`).render().replace(clear_regex, '')).toBe(`<div><p>#Here's a Heading</p></div>`)
    //     expect(new Markdown(`Here *is* text`).render().replace(clear_regex, '')).toBe(`<div><p>Here <i>is</i> text</p></div>`)
    //     expect(new Markdown(`Here **is** text`).render().replace(clear_regex, '')).toBe(`<div><p>Here <b>is</b> text</p></div>`)
    //     expect(new Markdown(`Here __is__ text`).render().replace(clear_regex, '')).toBe(`<div><p>Here <u>is</u> text</p></div>`)
    //     expect(new Markdown(`Here --is-- text`).render().replace(clear_regex, '')).toBe(`<div><p>Here <s>is</s> text</p></div>`)
    //     expect(new Markdown(`> Here is text`).render().replace(clear_regex, '')).toBe(`<div><blockquote><p>Here is text</p></blockquote></div>`)
    // })
    // test('Basic multilines', () => {
    //     expect(new Markdown(`
    //     ## Here's a Heading
    //     for this Doc

    //     Here is new paragraph
    //     with some **bold** text

    //     New paragraph with *italic* and --strice--
    //     `).render())
    //     .toBe(`<h2>Here's a Heading for this Doc</h2><p>Here is new paragraph<br>with some <b>bold</b> text</p><p>New paragraph with <i>italic</i> and <s>strice</s></p>`)
    // })
    new Markdown(`
# Here is header
with next line for some reason
### Here is subtitle

Here is paragrahp

> > Here is blockquote
> ## But here is blockquote with header
and next line

>> Here is blockquote also but multiline
# >> asdasd \\<< #
kind of...



\`here is code\` - one line

\`\`\`
Here is multiline code
>> asdadsa asd 


\`\`\`
`).render()
})