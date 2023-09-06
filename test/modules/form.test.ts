import { after } from 'node:test'
import {Form} from '../../src/modules/form'

const clear_regex = / ?v_[\s\S]{8}/gm

describe('Form module tests', () => {
    test('Creating form', () => {
        const form = new Form('form_test')
        expect(form.render().replace(clear_regex, '')).toBe('<div data-form=\"form_test\"></div>')
    })
    test('Form input - basic', () => {
        const form = new Form('form_test')
        form.input('name').label('Name')
        expect(form.render().replace(clear_regex, '')).toBe('<div data-form=\"form_test\"><label name=\"name\">Name</label><input type=\"text\"  name=\"name\"></div>')
    })
    test('Form input - basic group', () => {
        const form = new Form('form_test')
        form.group('langs', 'radio')
            .option('JavaScript').checked()
            .option('Rust')
            .option('Python')
        expect(form.render().replace(clear_regex, ''))
        .toBe(`<div data-form="form_test"><div input-group="langs"><label for="javascript_langs_radio">JavaScript</label><input type="radio" id="javascript_langs_radio" name="langs" value="JavaScript" checked><label for="rust_langs_radio">Rust</label><input type="radio" id="rust_langs_radio" name="langs" value="Rust"><label for="python_langs_radio">Python</label><input type="radio" id="python_langs_radio" name="langs" value="Python"></div></div>`)
    })
    test('Form input - normal group', () => {
        const form = new Form('form_test')
        form.group('langs', 'radio')
            .option('JavaScript', 'before', true).checked()
            .option('Rust', 'after')
            .option('Python')
        expect(form.render().replace(clear_regex, ''))
        .toBe(`<div data-form="form_test"><div input-group="langs"><label for="javascript_langs_radio">JavaScript</label><br><input type="radio" id="javascript_langs_radio" name="langs" value="JavaScript" checked><input type="radio" id="rust_langs_radio" name="langs" value="Rust"><label for="rust_langs_radio">Rust</label><label for="python_langs_radio">Python</label><input type="radio" id="python_langs_radio" name="langs" value="Python"></div></div>`)
    })
    test('Form input - advanced', () => {
        const form = new Form('form_test')
        form
            .input('name', 'text').label('Name').br()
            .input('description', 'textarea').label('Description').br()
            .input('phone', 'tel').label('Phone Number').br()
            .input('slider', 'progress').proxy('slider').oninput('on_slide', ({self}) => {
                console.log(self)
            })

        expect(form.render().replace(clear_regex, ''))
        .toBe(`<div data-form="form_test"><label name="name">Name</label><input type="text"  name="name"><br><label name="description">Description</label><textarea type="textarea"  name="description"></textarea><br><label name="phone">Phone Number</label><input type="tel"  name="phone"><br><input type="progress"  name="slider" input-proxy="slider" @input="on_slide"><script>(() => {HIVECRAFT_WORKER.$on_event('input[]', 'input', ({ self }) => {
            console.log(self);
        })})();</script></div>`)
    })
    test('Form input - advanced group', () => {
        const form = new Form('form_test')
        form.group('Toolkit', 'checkbox')
        .option('Visual Studio Code').checked().br()
        .option('Pycharm').checked().br()
        .option('Eclipse')
        .option('CodeBlock')

        form.group('Web Stack', 'checkbox', {default_br: true, label_position: 'after'})
        .option('React').checked()
        .option('Angular').checked()
        .option('PHP')
        .option('Vue').checked()
        .option('Nest').checked()
        .option('Next')
        .option('Express').checked()

        expect(form.render().replace(clear_regex, ''))
        .toBe(`<div data-form="form_test"><div input-group="toolkit"><label for="visual_studio_code_toolkit_checkbox">Visual Studio Code</label><input type="checkbox" id="visual_studio_code_toolkit_checkbox" name="toolkit" value="Visual Studio Code" checked><br><label for="pycharm_toolkit_checkbox">Pycharm</label><input type="checkbox" id="pycharm_toolkit_checkbox" name="toolkit" value="Pycharm" checked><br><label for="eclipse_toolkit_checkbox">Eclipse</label><input type="checkbox" id="eclipse_toolkit_checkbox" name="toolkit" value="Eclipse"><label for="codeblock_toolkit_checkbox">CodeBlock</label><input type="checkbox" id="codeblock_toolkit_checkbox" name="toolkit" value="CodeBlock"></div><div input-group="web_stack"><input type="checkbox" id="react_web_stack_checkbox" name="web_stack" value="React" checked><label for="react_web_stack_checkbox">React</label><br><input type="checkbox" id="angular_web_stack_checkbox" name="web_stack" value="Angular" checked><label for="angular_web_stack_checkbox">Angular</label><br><input type="checkbox" id="php_web_stack_checkbox" name="web_stack" value="PHP"><label for="php_web_stack_checkbox">PHP</label><br><input type="checkbox" id="vue_web_stack_checkbox" name="web_stack" value="Vue" checked><label for="vue_web_stack_checkbox">Vue</label><br><input type="checkbox" id="nest_web_stack_checkbox" name="web_stack" value="Nest" checked><label for="nest_web_stack_checkbox">Nest</label><br><input type="checkbox" id="next_web_stack_checkbox" name="web_stack" value="Next"><label for="next_web_stack_checkbox">Next</label><br><input type="checkbox" id="express_web_stack_checkbox" name="web_stack" value="Express" checked><label for="express_web_stack_checkbox">Express</label><br></div></div>`)
    })
    test('Form input - advanced mixed', () => {
        const form = new Form('form_test')
        form.input('Name').label().br()
        .input('Nick').label().br()
        .input('Issue', 'textarea').label().br()
        .input('Email', 'email').label().br()
        
        form.group('Toolkit', 'checkbox')
        .option('Visual Studio Code').checked().br()
        .option('Pycharm').checked().br()
        .option('Eclipse')
        .option('CodeBlock')

        form.group('Web Stack', 'checkbox', {default_br: true, label_position: 'after'})
        .option('React').checked()
        .option('Angular').checked()
        .option('PHP')
        .option('Vue').checked()
        .option('Nest').checked()
        .option('Next')
        .option('Express').checked()

        expect(form.render().replace(clear_regex, ''))
        .toBe(`<div data-form="form_test"><label name="Name">Name</label><input type="text"  name="Name"><br><label name="Nick">Nick</label><input type="text"  name="Nick"><br><label name="Issue">Issue</label><textarea type="textarea"  name="Issue"></textarea><br><label name="Email">Email</label><input type="email"  name="Email"><br><div input-group="toolkit"><label for="visual_studio_code_toolkit_checkbox">Visual Studio Code</label><input type="checkbox" id="visual_studio_code_toolkit_checkbox" name="toolkit" value="Visual Studio Code" checked><br><label for="pycharm_toolkit_checkbox">Pycharm</label><input type="checkbox" id="pycharm_toolkit_checkbox" name="toolkit" value="Pycharm" checked><br><label for="eclipse_toolkit_checkbox">Eclipse</label><input type="checkbox" id="eclipse_toolkit_checkbox" name="toolkit" value="Eclipse"><label for="codeblock_toolkit_checkbox">CodeBlock</label><input type="checkbox" id="codeblock_toolkit_checkbox" name="toolkit" value="CodeBlock"></div><div input-group="web_stack"><input type="checkbox" id="react_web_stack_checkbox" name="web_stack" value="React" checked><label for="react_web_stack_checkbox">React</label><br><input type="checkbox" id="angular_web_stack_checkbox" name="web_stack" value="Angular" checked><label for="angular_web_stack_checkbox">Angular</label><br><input type="checkbox" id="php_web_stack_checkbox" name="web_stack" value="PHP"><label for="php_web_stack_checkbox">PHP</label><br><input type="checkbox" id="vue_web_stack_checkbox" name="web_stack" value="Vue" checked><label for="vue_web_stack_checkbox">Vue</label><br><input type="checkbox" id="nest_web_stack_checkbox" name="web_stack" value="Nest" checked><label for="nest_web_stack_checkbox">Nest</label><br><input type="checkbox" id="next_web_stack_checkbox" name="web_stack" value="Next"><label for="next_web_stack_checkbox">Next</label><br><input type="checkbox" id="express_web_stack_checkbox" name="web_stack" value="Express" checked><label for="express_web_stack_checkbox">Express</label><br></div></div>`)
    })
})