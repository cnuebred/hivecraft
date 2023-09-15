
export type WorkerCallback = (cog: any) => void

class Tree {
    tree = {}
    data = {
        proxy: {},
        refs: {},
        params: {}
    }
    ext = {
        form: {},
        table: {},
        imports: {}
    }
    constructor() { }
}

const read_nest = (object: { [index: string]: any }, address: string | string[]) => {
    if (typeof address == 'string')
        address = address.split('.')

    const address_step = address.shift()

    if (address_step)
        return read_nest(object[address_step], address)
    else
        return object
}
const set_nest = (object: { [index: string]: any }, address: string | string[], value: any) => {
    if (typeof address == 'string')
        address = address.split('.')

    const address_step = address.shift()
    if (address_step)

        if (address.length > 1)
            read_nest(object[address_step], address)
        else
            object[address_step] = value
}
const deep_proxy = (container, callback) => {
    const handler: ProxyHandler<Object> = {
        get: (target, prop, receiver) => {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value == 'object' && value !== null) {
                return deep_proxy(value, callback)
            }
            return value
        },
        set: (target, prop, receiver) => {
            set_nest(target, prop as string, receiver)
            callback(container, target, prop, receiver)
            return true
        }
    }
    return new Proxy(container, handler)
}
const proxy_callback = (container, target, prop, receiver) => {
    const items = document.querySelectorAll(`[proxy_data="${prop}"]`)
    items.forEach(item => {
        item.textContent = read_nest(container, item.getAttribute('proxy_data') || '')
    })
}


export class HivecraftForm {
    form:HTMLElement
    fields: {[index:string]: HTMLElement} = {}
    proxy = deep_proxy({}, proxy_callback)
    constructor(form: HTMLElement){
        this.form = form
        this.init()
    }
    private init(){
        const inputs = this.form.querySelectorAll('input[data-input]')
            inputs.forEach(input => {
                const name = input.getAttribute('name') || '_'
                const proxy = input.getAttribute('input-proxy')
                this.fields[name] = input as HTMLElement
                if (proxy){
                    this.proxy[proxy] = input['value']
                    input.addEventListener('input', () => {
                        if(proxy) this.proxy[proxy] = input['value']
                    })
                }
            })
    }
    to_object(): object{
        const data = {}
        Object.entries(this.fields).forEach(([key, value]) => {
            data[key] = value['value']
        })
        return data
    }
    async fetch(url: string, headers: object = {}, data: object = {}, options: object = {}): Promise<Response>{
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
                ...headers
            },
            body: JSON.stringify({...this.to_object(), ...data}),
            ...options
        })
        return response
    }
    reset(){
        Object.values(this.fields).forEach(item => {
            item['value'] = ''
        })
    }
}
export class HivecraftTable {
    carbee_table:HTMLElement
    table: HTMLElement
    constructor(table: HTMLElement){
        this.carbee_table = table
        this.table = table.querySelector('table') as HTMLElement
        this.init()
    }
    init(){
        
    }
    find(row: number, column: number): HTMLElement | null {
        const rows = this.table.getElementsByTagName('tr');
        if (row >= 0 && row < rows.length) {
            const cells = rows[row].getElementsByTagName('td');
            if (column >= 0 && column < cells.length) {
                return cells[column];
            }
        }
        return null;
    }
    get(row: number, column: number): string | null {
        const cell = this.find(row, column)
       return cell ? cell.textContent : null
    }
    set(row: number, column: number, value: string | number | null): void {
        const cell = this.find(row, column)
        if(cell)
            cell.textContent = (value || '').toString() 
    }
    add_column(for_rows?: number[]) {
        const rows = this.table.getElementsByTagName('tr')
        for (let i = 0; i < rows.length; i++) {
            if(for_rows && !for_rows.includes(i)) continue
            const cell = document.createElement('td')
            rows[i].appendChild(cell)
        }
    }
    add_row() {
        const row = document.createElement('tr')
        let cell_count = 0
        Array.from(this.table.getElementsByTagName('tr')).forEach(item => {
            const cells = item.getElementsByTagName('td')
            cell_count = cells.length > cell_count ? cells.length : cell_count
        })
        for (let i = 0; i < cell_count; i++) {
            const cell = document.createElement('td')
            row.appendChild(cell)
        }

        this.table.appendChild(row)
    }
    get_headers(): (string | null)[] {
        const headerRow = this.table.querySelector('tr');
        const headers = headerRow ? Array.from(headerRow.querySelectorAll('th, td')).map(cell => cell.textContent) : [];
        return headers;
    }
    to_object(): object[] {
        const data: object[] = []
        const keys: string[] = []
        this.table.querySelectorAll('tr').forEach((row, row_index) => {
            data[row_index] = {} 
            row.querySelectorAll('th, td').forEach((column, column_index) => {
                if(row_index == 0)
                    keys.push(column.textContent || '')

                const column_name = keys[column_index] == undefined ? `column_${column_index}` : keys[column_index]
                data[row_index][column_name] = column.textContent 
            })  
        })


        return data
    }
    from_object(data: object[]) {
        this.clear_table()
        if (data.length == 0) return

        const headers = Object.keys(data[0])
        const row_count = data.length

        const header_row = document.createElement('tr')
        for (let i = 0; i < headers.length; i++) {
            const header_cell = document.createElement('th')
            header_cell.textContent = headers[i]
            header_row.appendChild(header_cell)
        }
        this.table.appendChild(header_row)

        for (let i = 0; i < row_count; i++) {
            const row_data = data[i]
            const data_row = document.createElement('tr')
            for (let j = 0; j < headers.length; j++) {
                const dataCell = document.createElement('td')
                dataCell.textContent = row_data[headers[j]]
                data_row.appendChild(dataCell)
            }
            this.table.appendChild(data_row)
        }
    }
    clear_table() {
        while (this.table.firstChild) {
            this.table.removeChild(this.table.firstChild)
        }
    }
}

export class CoreWorker extends Tree {
    constructor() {
        super()
    }
    private set_imports() {
        const items = document.querySelectorAll('script[local]')
        items.forEach(item => {
            this.ext.imports[item.getAttribute('local') || ''] = window[item.getAttribute('package') || '']
        })
    }
    private set_refs() {
        const items = document.querySelectorAll('[ref]')
        items.forEach(item => {
            this.data.refs[item.getAttribute('ref') || ''] = item
        })
    }
    private set_forms() {
        const forms = document.querySelectorAll('div[data-form]')
        forms.forEach(divform => {
            const form_name = divform.getAttribute('data-form') || '_'
            const form = new HivecraftForm(divform as HTMLElement)
            this.ext.form[form_name] = form           
        })
    }
    private set_table(){
        const tables = document.querySelectorAll('div[table]')
        tables.forEach(divtable => {
            const table_name = divtable.getAttribute('table') || '_'
            const table = new HivecraftTable(divtable as HTMLElement)
            this.ext.table[table_name] = table           
        })
    }
    private set_params(){
        const url_params = new URLSearchParams(window.location.search)
        const it = url_params.entries()
        for (let [key, value] of it){
            this.data.params[key.toString()] = value.toString()
        }
    }
    init(): CoreWorker {
        this.set_params()
        this.set_imports()
        this.set_refs()
        this.data.proxy = deep_proxy(this.data.proxy, proxy_callback)
        this.set_forms()
        this.set_table()
        return this
    }
    $on_event(query: string, event: string, callback: WorkerCallback) {
        const self = document.querySelector(query)
        if (!this.tree[query])
            this.tree[query] = {}
        self?.addEventListener(event, () => {
            callback({
                self,
                item: this.tree[query],
                data: this.data,
                ext: this.ext
            })
        })
    }
}



