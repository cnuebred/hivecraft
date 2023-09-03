import { CellStyle } from '../src/style';
import { Cell } from '../src/cell';
import { CellRenderOptionsType } from '../src/d';

describe('Cell class tests', () => {
    let cell: Cell;

    beforeEach(() => {
        cell = new Cell();
    });

    test('initial properties', () => {
        expect(cell.type).toBe('block');
        expect(cell.tag).toBe('div');
        expect(cell.hash).toHaveLength(10);
        expect(cell.parent).toBeUndefined();
        expect(cell.style).toBeInstanceOf(CellStyle);
    });

    test('setting and getting properties', () => {
        cell.tag = 'p';
        expect(cell.tag).toBe('p');
        const style_obj = { color: 'red' };
        cell.style = style_obj;
        expect(cell.style.css).toEqual(style_obj);

        const attributes_obj = { id: 'my-id', class: 'my-class' };
        cell.attributes = attributes_obj;
        expect(cell.attributes.get('id')).toBe('my-id');
        expect(cell.attributes.get('class')).toBe('my-class');
    });

    test('adding', () => {
        cell.text('Hello, world!');
        expect(cell.content.length).toBe(1);
        expect(cell.content[0]).toBeInstanceOf(Cell);
        expect(cell.content[0].render()).toBe('Hello, world!');

        cell.cell('div');
        expect(cell.content.length).toBe(2);
        expect(cell.content[1]).toBeInstanceOf(Cell);
        expect((cell.content[1] as Cell).tag).toBe('div');
    });

    test('setting render options', () => {
        const options: CellRenderOptionsType = {
            no_script: true
        };
        cell.set_render_options(options);
        expect(cell.render()).toMatch(/<div v_[\w\W]{8}>/);
        expect(cell.render()).not.toContain('<script');
    });

    test('finding elements', () => {
        cell.cell('div').text('value');
        const found_cell = cell.find(item => item.render() == 'value');
        expect(found_cell?.render()).toBe('value');
    });

    test('clear values', () => {
        cell.text('text 1').text('text 2').cell('div').text('text in cell');
        expect(cell.content.length).toBe(3);

        cell.clear();
        expect(cell.content.length).toBe(0);
    });

    test('cell copy', () => {
        cell.text('Text').cell('div').text('Cell');

        const copied_cell = cell.copy();
        expect(copied_cell.content.length).toBe(2);
        expect(copied_cell.content[0].render()).toBe('Text');
        expect(copied_cell.content[1].tag).toBe('div');
        expect((copied_cell.content[1].content[0].render())).toBe('Cell');
    });

});
