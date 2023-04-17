import { BrickTree } from "./core"
import { EventType, HashType, QueryType } from "./d"

const worker: any = null

type EventCallback = (cog: any) => void

export class BrickEvent {
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
        const script = `worker.$on_event(${this.query}, ${this.type}, ${this.callback})`
        return script
    }
}



export class BrickWorker extends BrickTree {
    events: BrickEvent[]
    constructor() { super() }
    render(): string {
        const scripts = this.events.join(';')
        return scripts
    }
    // base_types
    click() { return this.push('click') }
    blur() { return this.push('blur') }
    // !base_types
    push(type: string) {
        return {
            callback: (callback: EventCallback): BrickWorker => {
                const event = new BrickEvent(type, this.query)
                event.callback = callback
                this.events.push(event)
                return this
            }
        }
    }
    copy(): BrickWorker {
        const worker_copy = new BrickWorker()
        worker_copy.events = [...this.events];

        return worker_copy
    }

}