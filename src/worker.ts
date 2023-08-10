import { inspect } from "util";
import { Cell } from "./cell"
import { EventType, HashType, QueryType } from "./d"
import { CellTree } from "./utils"

type CallbackCog = {
    self: HTMLElement,
    item: { [index: string]: any },
    data: {
        proxy: { [index: string]: any },
        refs: { [index: string]: any },
        params: { [index: string]: any },
    },
    ext: {
        table: { [index: string]: any },
        form: { [index: string]: any },
        imports: { [index: string]: any },
    }
}
type Callback = (cog: CallbackCog) => void

abstract class WorkerCellPoint {
    query: QueryType
    abstract render(): string
}

export class CellEvent extends WorkerCellPoint {
    type: string
    #callback: Callback
    constructor(type: string, query: QueryType) {
        super()
        this.type = type
        this.query = query
    }
    set callback(value: Callback) { this.#callback = value }
    get callback() { return this.#callback }
    render(): string {
        const script = `(() => {HIVECRAFT_WORKER.$on_event('${this.query}', '${this.type}', ${this.callback})})();`
        return script
    }
}
export class CellPure extends WorkerCellPoint {
    name: string
    #callback: Callback
    constructor(name: string, query: QueryType) {
        super()
        this.name = name
        this.query = query
    }
    set callback(value: Callback) { this.#callback = value }
    get callback() { return this.#callback }
    render() {
        const script = `(() => {HIVECRAFT_WORKER.pure['${this.name.replaceAll(/ /gm, '_')}'] = ${this.callback}})();`
        return script
    }
}

export class CellProxy extends WorkerCellPoint {
    name: string
    value: string | number
    constructor(name: string, value: string | number, query: QueryType) {
        super()
        this.name = name
        this.value = value
        this.query = query
    }
    render() {
        const script = `(() => {HIVECRAFT_WORKER.proxy['${this.name}']=${this.value}})();`
        return script
    }
}



export class CellWorker extends CellTree {
    worker_cells: WorkerCellPoint[] = []
    constructor() { super() }
    empty(): boolean {
        return this.worker_cells.length == 0
    }
    join() { return this.worker_cells.map(item => { return item.render() }).join('') }
    generate(): Cell {
        const script = new Cell('script')
        script.text(this.join())
        return script
    }
    
    event(event: string, callback: Callback) {
        const call_event = new CellEvent(event, this.query)
        call_event.callback = callback
        this.worker_cells.push(call_event)
        return this
    }

    pure(name: string, callback: Callback) {
        const call_event = new CellEvent(name, this.query)
        call_event.callback = callback
        this.worker_cells.push(call_event)
        return this
    }

    proxy(name: string, value?: string | number | null): CellWorker {
        const proxy = new CellProxy(name, value, this.query)
        this.worker_cells.push(proxy)
        return this
    }
    copy(): CellWorker {
        const worker_copy = new CellWorker()
        worker_copy.worker_cells = [...this.worker_cells];

        return worker_copy
    }

}