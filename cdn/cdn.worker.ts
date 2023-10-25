import { isContinueStatement, isJsxAttribute, isNumericLiteral } from "typescript"

type WorkerCallback = (cog: any, eve?: Event) => void

class Tree {
    tree = {}
    data = {
        pure: {},
        proxy: {},
        refs: {},
        params: {}
    }
    ext: { form: any, table: any, templates: { [index: string]: HivecraftTemplate } } = {
        form: {},
        table: {},
        templates: {},
    }
    imports = {}
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
const deep_proxy = (container, callback, only_set: boolean = true) => {
    const handler: ProxyHandler<Object> = {
        get: (target, prop, receiver) => {
            const value = Reflect.get(target, prop, receiver);
            if (typeof prop == 'string' && (prop as string).startsWith('__') && (prop as string).endsWith('__'))
                return value

            if (typeof value == 'object' && value !== null) {
                return deep_proxy(value, callback, only_set)
            }
            if (!only_set) callback(container, target, prop, receiver)
            return value
        },
        set: (target, prop, receiver) => {
            if ((prop as string).startsWith('__') && (prop as string).endsWith('__'))
                return true
            if (typeof receiver == 'object' && receiver !== null) {
                {
                    if (Array.isArray(receiver))
                        receiver = receiver.map((item, index) => {
                            if (!item['__hc_parent_name__'] && typeof item == 'object' && item !== null) {
                                item['__hc_parent_name__'] = `${prop.toString()}.${index}`
                            } else if (item['__hc_parent_name__']) {
                                item['__hc_parent_name__'] = `${prop.toString()}.${index}`
                            }
                            return item
                        })

                    const new_hc_parent = !!target['__hc_parent_name__'] ? `${target['__hc_parent_name__']}.${prop as string}` : prop
                    Object.defineProperty(receiver, '__hc_parent_name__', {
                        value: new_hc_parent,
                        writable: true,
                    })

                }
            }
            set_nest(target, prop as string, receiver)
            callback(container, target, prop, receiver)
            return true
        }
    }
    return new Proxy(container, handler)
}
const proxy_callback_render_elements = async (container, prop) => {
    let proxy_data = prop
    if (container.__hc_parent_name__)
        proxy_data = `${container['__hc_parent_name__']}.${prop}`
    const items = document.querySelectorAll(`[proxy_data="${proxy_data}"]`)
    items.forEach(item => {
        item.textContent = read_nest(container, prop as string || '')
    })
}
const proxy_callback_render_attributes = async (container, prop) => {
    let proxy_data = prop
    if (container.__hc_parent_name__)
        proxy_data = `${container['__hc_parent_name__']}.${prop}`

    const items = document.querySelectorAll(`[proxy_attr$="${proxy_data}"]`)

    for (const item of items) {
        const proxy_attribute = item.getAttribute('proxy_attr') as string

        const [attr, value] = proxy_attribute.split(' ')
            .find(item => item.split(':')[1].endsWith(proxy_data))
            ?.split(':') as string[]

        if (!attr || !value) return
        const origin_proxy_data = item.getAttribute(attr)

        if (!item[`origin_proxy_${attr}`])
            item[`origin_proxy_${attr}`] = origin_proxy_data

        const target_proxy_attr = item[`origin_proxy_${attr}`]
            .replaceAll(`[[${proxy_data}]]`, read_nest(container, prop))

        item.setAttribute(attr, target_proxy_attr)
    }
}
const proxy_callback_hivecraft_form = (self, container, prop) => {
    proxy_callback_render_elements(container, prop)
    self.form.querySelectorAll(`[input-proxy="${prop}"]`).forEach(item => {
        item['value'] = read_nest(container, item.getAttribute('input-proxy') || '')
    })
}


class HivecraftTemplate {
    base: HTMLElement
    parent: HTMLElement
    template: HTMLElement
    hivecraft: CoreWorker
    proxy: any
    refer: string
    proxy_name: string
    last_section: number
    hooked: boolean = false
    contains_hooks: string[] = []
    children: { [index: string]: HivecraftTemplate } = {}
    events: any = []
    constructor(base: HTMLElement, self) {
        this.hivecraft = self
        this.base = base
        this.proxy = this.hivecraft.data.proxy
        this.template = this.get_template(this.base)
    }
    setup() {
        const for_item = this.base.getAttribute('hc-for')
        const [refer, proxy_name] = for_item?.split(' for ') as string[]
        this.refer = refer
        this.proxy_name = proxy_name

        this.base.querySelectorAll('[hc-for]').forEach(item => {
            item.setAttribute('hc-for-child', '')
        })

        this.base.style.display = 'none'
    }
    render_all() {
        const list = this.proxy[this.proxy_name]
        const section = Math.ceil(Math.random() * (10000 - 100) + 100)
        if (!Array.isArray(list)) return
        const template_base = this.template
        list.forEach((item_group, index) => {
            const index_selector = index.toString() + '_' + section + '_' + this.base.attributes[0].name + this.proxy_name
                if (!document.querySelector(`hc-template[v="${this.base.attributes[0].name}"]`)) {
                    this.create_single_template(template_base, item_group, (element) => {
                        element.setAttribute('index', index_selector)
                        if (!this.base.hasAttribute('hc-for-child'))
                            this.base.before(element)
                    })
                }
                else {
                    document.querySelectorAll(`hc-template[v="${this.base.attributes[0].name}"]`).forEach((item, index) => {
                        this.create_single_template(template_base, item_group, async (element) => {
                            element.setAttribute('index', index_selector)
                            element.setAttribute('no', index.toString())
                            item.before(element)
                        })
                    })
                }
        })
        document.querySelectorAll(`[index*="${this.last_section}_${this.base.attributes[0].name + this.proxy_name}"]`).forEach(item => item.remove())
        this.last_section = section
        template_base.querySelectorAll('hc-template').forEach(item => {
            this.hivecraft.ext.templates[item.getAttribute('v') || '']?.render_all()
        })
    }
    replace_in_template(ref_item, template, replacer?: { [index: string]: any } | string | number | null) {
        if (replacer)
            ref_item.innerHTML = template.innerHTML.replace(new RegExp(`\\[@\\[${this.refer}\\.(\\w+)\\]\\]`, 'gm'), (_, _1, _2) => {
                return typeof replacer == 'object' ? read_nest(replacer, _1 as string || '') : replacer
            })
    }
    async set_template_event(element, template) {
        if (!template.querySelector('[eve]')) return
        template.querySelectorAll('[eve]').forEach(item => {
            if (item['events_list'])
                item['events_list'].forEach(li_event => {
                    element.querySelectorAll(li_event[1]).forEach(qr_item => {
                        qr_item['events_list'] = [...item['events_list']]
                        const event_pack = item['events_list']
                        event_pack.forEach(event => {
                            const no = !!element.getAttribute('no') ? `[no="${element.getAttribute('no')}"]` : ''
                            this.hivecraft.$on_event(
                                `[index="${element.getAttribute('index')}"]${no} ${event[1]}`,
                                event[0],
                                event[2]
                            )
                        })
                    })
                })
        })
    }
    single_template(element: HTMLElement, template, replacer?: { [index: string]: any } | string | number | null): void {
        this.replace_in_template(element, template, replacer)
        this.set_template_event(element, template)
    }
    create_single_template(template: HTMLElement, replacer?: { [index: string]: any } | string | number | null, callback?: null | ((element: HTMLElement) => void)): HTMLElement {
        const new_element = template.cloneNode(true) as HTMLElement
        if (callback) callback(new_element)
        this.single_template(new_element, template, replacer)
        return new_element
    }
    get_template(base) {
        const template = this.create_single_template(base, null, (template) => {
            template.querySelectorAll('[hc-for]').forEach((item, index) => {
                const template = document.createElement('hc-template')
                template.setAttribute('v', item.attributes[0].name)
                item.replaceWith(template)
            })
            base.querySelectorAll('[eve]').forEach((item, index) => {
                if (template.querySelector(`[${item.attributes[0].name}]`))
                    this.events.push(...item['events_list'])
            })
            template.removeAttribute(template.attributes[0].name)
            template.removeAttribute('hc-for')
            template.removeAttribute('hc-for-child')
            template.removeAttribute('style')
        })
        return template
    }
    render(parent: string, prop: string) {
        //const start = performance.now()
        const list = this.proxy[this.proxy_name]
        if (!parent || prop == 'length') {
            this.render_all()
        } else {
            const part_index = parent.split('.').pop()
            if (!isNaN(Number(part_index))) {
                const indexed_object = list[Number(part_index)]
                const templates = document.querySelectorAll(`[index^="${part_index}_"][index$="${this.base.attributes[0].name + this.proxy_name}"]`) as unknown as HTMLElement[]

                if (templates.length != 0)
                    templates.forEach(item => {
                        this.single_template(item, this.template, indexed_object)
                    })
            }
        }
        //console.log('render in ', performance.now() - start)
    }
}

class HivecraftForm {
    form: HTMLElement
    fields: { [index: string]: HTMLElement } = {}
    proxy = deep_proxy({}, (container, target, prop) => {
        proxy_callback_hivecraft_form(this, container, prop)
    })
    constructor(form: HTMLElement) {
        this.form = form
        this.init()
    }
    private init() {
        const inputs = this.form.querySelectorAll('input[data-input]')
        inputs.forEach(input => {
            const name = input.getAttribute('name') || '_'
            const proxy = input.getAttribute('input-proxy')
            this.fields[name] = input as HTMLElement
            if (proxy) {
                this.proxy[proxy] = input['value']
                input.addEventListener('input', () => {
                    const proxy_name = input.getAttribute('input-proxy')
                    if (proxy_name) this.proxy[proxy_name] = input['value']
                })
            }
        })
    }
    to_object(): object {
        const data = {}
        for (let field_key in this.fields) {
            data[field_key] = this.fields[field_key]['value'];
        }
        return data
    }
    async fetch(url: string, headers: object = {}, data: object = {}, options: object = {}): Promise<Response> {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
                ...headers
            },
            body: JSON.stringify({ ...this.to_object(), ...data }),
            ...options
        })
        return response
    }
    reset() {
        Object.values(this.fields).forEach(item => {
            item['value'] = ''
        })
    }
}
class HivecraftTable {
    carbee_table: HTMLElement
    table: HTMLElement
    constructor(table: HTMLElement) {
        this.carbee_table = table
        this.table = table.querySelector('table') as HTMLElement
        this.init()
    }
    init() {

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
        if (cell)
            cell.textContent = (value || '').toString()
    }
    add_column(for_rows?: number[]) {
        const rows = this.table.getElementsByTagName('tr')
        for (let i = 0; i < rows.length; i++) {
            if (for_rows && !for_rows.includes(i)) continue
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
                if (row_index == 0)
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
    private render_cog = (query) => {
        const self = document.querySelectorAll(query)
        if (!this.tree[query])
            this.tree[query] = {}
        const cog = {
            self,
            item: this.tree[query],
            data: this.data,
            ext: this.ext,
            imports: this.imports
        }
        return cog
    }
    private proxy_callback_render_list = async (container, prop) => {
        for (const template in this.ext.templates) {
            const item = this.ext.templates[template]
            if ((item.proxy_name == prop || (container['__hc_parent_name__'] && container['__hc_parent_name__'].startsWith(item.proxy_name)))) {
                item.render(container['__hc_parent_name__'], prop)
            }
        }

    }
    private proxy_callback = (container, target, prop) => {
        this.proxy_callback_render_list(container, prop)
        proxy_callback_render_elements(container, prop)
        proxy_callback_render_attributes(container, prop)
        this.set_conditions()
    }
    private set_conditions() {
        const if_elements = document.querySelectorAll('[hc-if]')
        if_elements.forEach(item => {
            const hash = item.getAttribute('hc-if')
            const query = `hc-if_${hash}`

            const foo = this.data.pure[query]
            const render_condition: boolean = !foo ? this.data.proxy[query] : foo(this.render_cog(`[${hash}]`))
            if (render_condition != null)
                (item as HTMLElement).style.setProperty('display', render_condition ? 'block' : 'none')


        })

    }
    private set_imports() {
        const items = document.querySelectorAll('script[local]')
        items.forEach(item => {
            this.imports[item.getAttribute('local') || ''] = window[item.getAttribute('package') || '']
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
    private set_templates() {
        const for_loop = document.querySelectorAll('[hc-for]')
        Array.from(for_loop).forEach(item => {
            const template = new HivecraftTemplate(item as HTMLElement, this)
            template.setup()
            this.ext.templates[item.attributes[0].name] = template
        })
    }
    private set_table() {
        const tables = document.querySelectorAll('div[table]')
        tables.forEach(divtable => {
            const table_name = divtable.getAttribute('table') || '_'
            const table = new HivecraftTable(divtable as HTMLElement)
            this.ext.table[table_name] = table
        })
    }
    private set_params() {
        const url_params = new URLSearchParams(window.location.search)
        const it = url_params.entries()
        for (let [key, value] of it) {
            this.data.params[key.toString()] = value.toString()
        }
    }
    before_start(): CoreWorker {
        this.set_params()
        this.set_imports()
        this.set_refs()
        this.data.proxy = deep_proxy(this.data.proxy, this.proxy_callback)
        this.set_forms()
        this.set_table()
        return this
    }
    after_start(): CoreWorker {
        this.set_conditions()
        this.set_templates()
        return this
    }
    $on_event(query: string | HTMLElement, event: string, callback: WorkerCallback, save: boolean = true) {
        const cog = this.render_cog(query)
        cog.self?.forEach((self_item: HTMLElement) => {
            if (save) {
                if (!self_item['events_list']) self_item['events_list'] = []
                self_item['events_list'].push([event, query, callback])
            }
            self_item.setAttribute('eve', '')
            self_item.addEventListener(event, (eve) => {
                callback({ ...cog, ...{ self: self_item } }, eve)
            })
            // self_item[`on${event}`] = (eve) => callback({ ...cog, ...{ self: self_item } }, eve)
        })
    }
    $pure(query: string, name: string, callback: WorkerCallback) {
        const cog = this.render_cog(query)
        cog.self.forEach(self_item => {
            if (name.startsWith('onload_'))
                callback({ ...cog, ...{ self: self_item } })
            if (name.startsWith('hc-if_'))
                this.data.proxy[name] = callback({ ...cog, ...{ self: self_item } })

            this.data.pure[name.replace(/ /gm, '_')] = () => callback({ ...cog, ...{ self: self_item } })
        })
    }
    $proxy(name: string, value: string | boolean | number | null, json: boolean) {
        if (json)
            value = JSON.parse(value as string)
        this.data.proxy[name.replace(/ /gm, '_')] = value
    }
}


