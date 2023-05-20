import { inspect } from "util";
import { Cell } from "./cell"
import { EventType, HashType, QueryType } from "./d"
import { CellTree } from "./utils"

type EventCallbackCog = {
    self: HTMLElement,
    item: {[index:string]: any},
    proxy: {[index:string]: any},
    refs: {[index:string]: any},
    imports: {[index:string]: any}
}
type EventCallback = (cog: EventCallbackCog) => void

export class CellEvent {
    type: string
    query: QueryType
    private _callback: EventCallback
    constructor(type: string, query: QueryType) {
        this.type = type
        this.query = query
    }
    set callback(value: EventCallback) { this._callback = value }
    get callback() { return this._callback }
    render() {
        const script = `(() => {CARBEE_WORKER.$on_event('${this.query}', '${this.type}', ${this.callback})})();`
        return script
    }
}

export class CellProxy {
    name: string
    value: string | number
    query: QueryType
    constructor(name:string, value: string | number, query: QueryType) {
        this.name = name
        this.value = value
        this.query = query
    }
    render() {
        const script = `(() => {CARBEE_WORKER.proxy['${this.name}']=${this.value}})();`
        return script
    }
}



export class CellWorker extends CellTree {
    events: CellEvent[] = []
    proxy: CellProxy[] = []
    constructor() { super() }
    empty(): boolean {
        return this.events.length == 0
    }
    join():string{
        return [...this.events, ...this.proxy].map(item => { return item.render() }).join('')
    }
    generate(): Cell {
        const script = new Cell('script')
        const text = script.text(this.join())
        text.category = 'script'
        return script
    }
    // base_types
    click() { return this.add('click') }
    blur() { return this.add('blur') }
    // !base_types
    add(type: string) {
        return {
            callback: (callback: EventCallback): CellWorker => {
                const event = new CellEvent(type, this.query)
                event.callback = callback
                this.events.push(event)
                return this
            },
            proxy: (name:string, value?: string | number | null): CellWorker => {
                const proxy = new CellProxy(name, value, this.query)
                this.proxy.push(proxy)
                return this
            }
        }
    }
    copy(): CellWorker {
        const worker_copy = new CellWorker()
        worker_copy.events = [...this.events];

        return worker_copy
    }

}