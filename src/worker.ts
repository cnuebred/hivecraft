import { inspect } from "util";
import { Cell } from "./cell"
import { EventType, HashType, QueryType } from "./d"
import { CellTree } from "./utils"

type CallbackCog = {
    self: HTMLElement,
    item: {[index:string]: any},
    proxy: {[index:string]: any},
    refs: {[index:string]: any},
    imports: {[index:string]: any}
}
type Callback = (cog: CallbackCog) => void

abstract class WorkerCellPoint{
    query: QueryType
    abstract render():string
}

export class CellEvent extends WorkerCellPoint {
    type: string
    private _callback: Callback
    constructor(type: string, query: QueryType) {
        super()
        this.type = type
        this.query = query
    }
    set callback(value: Callback) { this._callback = value }
    get callback() { return this._callback }
    render(): string {
        const script = `(() => {CARBEE_WORKER.$on_event('${this.query}', '${this.type}', ${this.callback})})();`
        return script
    }
}
export class CellPure extends WorkerCellPoint{
    name: string
    private _callback: Callback
    constructor(name: string, query: QueryType) {
        super()
        this.name = name
        this.query = query
    }
    set callback(value: Callback) { this._callback = value }
    get callback() { return this._callback }
    render() {
        const script = `(() => {CARBEE_WORKER.pure['${this.name.replaceAll(/ /gm, '_')}'] = ${this.callback}})();`
        return script
    }
}

export class CellProxy  extends WorkerCellPoint{
    name: string
    value: string | number
    constructor(name:string, value: string | number, query: QueryType) {
        super()
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
    worker_cells: WorkerCellPoint[] = []
    constructor() { super() }
    empty(): boolean {
        return this.worker_cells.length == 0
    }
    join():string{
        return this.worker_cells.map(item => { return item.render() }).join('')
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
    add(name: string) {
        return {
            event: (callback: Callback): CellWorker => {
                const event = new CellEvent(name, this.query)
                event.callback = callback
                this.worker_cells.push(event)
                return this
            },
            proxy: (value?: string | number | null): CellWorker => {
                const proxy = new CellProxy(name, value, this.query)
                this.worker_cells.push(proxy)
                return this
            },
            pure: (callback: Callback): CellWorker =>{
                const event = new CellPure(name, this.query)
                event.callback = callback
                this.worker_cells.push(event)
                return this
            }
        }
    }
    copy(): CellWorker {
        const worker_copy = new CellWorker()
        worker_copy.worker_cells = [...this.worker_cells];

        return worker_copy
    }

}