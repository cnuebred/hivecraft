import { Cell } from "../cell";

type TableContent = string | number | null
type TableStripComplex = (TableContent | [TableContent, number, number])[]
export type TableArrayComplex = TableStripComplex[]
export type TableObjectComplex = { [index: string]: TableStripComplex }


export class Table extends Cell {
    table_name: string
    private size: [number, number] = [0, 0]
    private _table: Cell
    constructor(name: string) {
        super('div')

        if (name.match(/([\W\d])/))
            throw new Error('Name of table cannot include symbols and digits')

        this.table_name = name
        this.attributes.set('table', this.table_name)

        this._table = new Cell('table')
        this._table.attributes.set('$module', 'data-table')
        this.push(this._table)
    }
    push_column(column: TableStripComplex, tag: string = 'td', with_header: boolean = false): Table {
        this.size[1] = column.length > this.size[1] ? column.length : this.size[1]
        this.size[0]++
        if (!this._table.find((item: Cell) => item?.tag == 'tr'))
            for (let i in column) this._table.cell('tr')
        let tag_buffor = tag
        this._table.for_each((item: Cell, index: number) => {
            const element = column.shift()
            if (with_header && index == 0) tag_buffor = 'th'
            else tag_buffor = tag
            if (Array.isArray(element)) {
                const td = item.cell(tag_buffor)
                td.text(element[0]?.toString() || '')
                td.attributes.from({ rowspan: element[1].toString(), colspan: element[2].toString() })
                return
            }

            item.cell(tag_buffor).text(element?.toString() || '')
        }, { only: 'block', tag: ['tr'], self: false })

        return this
    }
    push_row(row: TableStripComplex, tag: string = 'td'): Table {
        this.size[0] = row.length > this.size[0] ? row.length : this.size[0]
        this.size[1]++

        const tr = this._table.cell('tr')
        row.forEach(item => {
            const td = tr.cell(tag)
            if (Array.isArray(item)) {
                td.text(item[0]?.toString() || '')
                td.attributes.from({ rowspan: item[1].toString(), colspan: item[2].toString() })
                return
            }
            td.text(item.toString() || '')
        })
        return this
    }
    from(from_table?: TableArrayComplex | TableObjectComplex, header: boolean = false) {
        if (Array.isArray(from_table))
            from_table.forEach((row, index) => {
                this.push_row(row, index == 0 && header ? 'th' : 'td')
            })
        else {
            Object.entries(from_table).forEach(([key, value]) => {
                this.push_column([key, ...value], 'td', header)
            })
        }
        return this
    }
}