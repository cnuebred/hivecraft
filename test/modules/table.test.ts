import { Table, TableArrayComplex, TableObjectComplex } from "../../src/modules/table"

const clear_regex = / v_[\s\S]{8}/gm

describe('Table module tests', () => {
    test('Creating table', () => {
        const table  = new Table('test_table')
        expect(table.render().replace(/v_[\s\S]{8}/gm, '')).toBe('<div  table="test_table"><table  data-table></table></div>')
    })
    test('Set table data - array', () => {
        const table = new Table('test_table')
        const table_data = [
            [1, 2, 3],
            ['pomodore', 'calsium', 'jersin'],
            ['+12', '+44', '+0']
        ]
        table.from(table_data)
        expect(table.render().replace(clear_regex, ''))
        .toBe('<div table="test_table"><table data-table><tr><td>1</td><td>2</td><td>3</td></tr><tr><td>pomodore</td><td>calsium</td><td>jersin</td></tr><tr><td>+12</td><td>+44</td><td>+0</td></tr></table></div>')
    })
    test('Set table data - array span', () => {
        const table = new Table('test_table')
        const table_data: TableArrayComplex = [
            [1, 2, 3],
            ['pomodore', ['calsium', 2, 1], 'jersin'],
            ['+12', '+44', '+0']
        ]
        table.from(table_data)
        expect(table.render().replace(clear_regex, ''))
        .toBe('<div table=\"test_table\"><table data-table><tr><td>1</td><td>2</td><td>3</td></tr><tr><td>pomodore</td><td rowspan=\"2\" colspan=\"1\">calsium</td><td>jersin</td></tr><tr><td>+12</td><td>+44</td><td>+0</td></tr></table></div>')
    })
    test('Set table data - array span with header | asymmetric', () => {
        const table = new Table('test_table')
        const table_data: TableArrayComplex = [
            [1, 2, 3],
            ['pomodore', ['calsium', 2, 1], 'jersin'],
            ['+12', '+44', '+0', '+10']
        ]
        table.from(table_data, true)
        expect(table.render().replace(clear_regex, ''))
        .toBe('<div table=\"test_table\"><table data-table><tr><th>1</th><th>2</th><th>3</th></tr><tr><td>pomodore</td><td rowspan=\"2\" colspan=\"1\">calsium</td><td>jersin</td></tr><tr><td>+12</td><td>+44</td><td>+0</td><td>+10</td></tr></table></div>')
    })
    test('Set table data - object', () => {
        const table = new Table('test_table')
        const table_data: TableObjectComplex = {
            Name: ['Tom', 'Bob', 'Jerry'],
            Age: [23, 18, 99],
            Country: ['Poland', 'Nigeria', 'Russia']
        } 
        table.from(table_data, true)
        expect(table.render().replace(clear_regex, ''))
        .toBe('<div table=\"test_table\"><table data-table><tr><th>Name</th><th>Age</th><th>Country</th></tr><tr><td>Tom</td><td>23</td><td>Poland</td></tr><tr><td>Bob</td><td>18</td><td>Nigeria</td></tr><tr><td>Jerry</td><td>99</td><td>Russia</td></tr></table></div>')
    })
})