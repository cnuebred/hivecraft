import { CellAttributes } from "../attributes";
import { Cell } from "../cell";
import { CellLocation } from "../d";
import { CellText } from "../text";

type TableContent = string | number | null
type TableStrip = TableContent[]
type TableStripComplex = (TableContent | [TableContent, number, number])[]
type TableType = TableStrip[]
type TableTypeComplex = TableStripComplex[]

export class Table extends Cell {
    table_name: string
    private _symmetric: boolean = false
    private size: [number, number] = [0, 0]
    private _table: Cell
    constructor(name:string) {
        super('div')

        if (name.match(/([\W\d])/))
            throw new Error('Name of table cannot include symbols and digits')

        this.table_name = name
        this.attributes.set('table', this.table_name)
        
        this._table = new Cell('table')
        this._table.attributes.set('data-table', null)
        this.push(this._table)
    }
    set symmetric(value:boolean){
        this._symmetric = value
    }
    push_column(column:  TableStripComplex, tag: string = 'td'): Table{
        this.size[1] = column.length > this.size[1] ? column.length : this.size[1]
        this.size[0]++

        if(!this._table.#content.find((item:Cell) => item?.tag == 'tr'))
        this._table.cell('tr')
        
        this._table.forEach((item:Cell) => {
            const element = column.shift()
            if (Array.isArray(element))
                {
                    const td = item.cell(tag)
                    td.text(element[0]?.toString() || '')
                    td.attributes.from({rowspan: element[1].toString(), colspan: element[2].toString()})
                    return
                }
            
            item.cell(tag).text(element?.toString() || '')
        }, {only: 'block', tag: ['tr'], self:false})

        if(this._symmetric)
        column.forEach(item => {
            const tr = this._table.cell('tr')
            for(let i =0 ; i< this.size[0] -1 ; i++){
                tr.cell(tag).text('')
            }
            tr.cell(tag).text(item.toString() || '')
        })
        
        return this
    }
    push_row(row: TableStripComplex, tag: string = 'td'): Table{
        this.size[0] = row.length > this.size[0] ? row.length : this.size[0]
        this.size[1]++

        const tr = this._table.cell('tr')
        row.forEach(item => {
            const td = tr.cell(tag)
            if (Array.isArray(item)){
                td.text(item[0]?.toString() || '')
                td.attributes.from({rowspan: item[1].toString(), colspan: item[2].toString()})
                return
            }
            td.text(item.toString() || '')
        })

        if(this._symmetric)
        this._table.forEach((item:Cell) => {    
            if(item.#content.length < this.size[0])
                item.cell(tag).text('')
        }, {only: 'block', tag: ['tr'], self:false})

        return this
    }
    put(row:number, column:number, value: TableContent){
        this._table.forEach((item:Cell, index:number) => {   
            if(index == row)
                (item.#content[column] as Cell).text(value.toString(), true)
        }, {only: 'block', tag: ['tr'], self:false})
    }
    from(from_table?: TableTypeComplex) {
        from_table.forEach(row => {
            this.push_row(row)
        })
        return this
    }

}