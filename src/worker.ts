import { Brick } from "./core"
import { EventType, HashType, QueryType } from "./d"
import { BrickTree } from "./utils"

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
    events: BrickEvent[] = []
    constructor() { super() }
    generate(): Brick {
        const script = new Brick('script')
        script.text(
            this.events.map(item => {return item.render()}).join(';')
        )
        return script
    }
    // base_types
    click() { return this.add('click') }
    blur() { return this.add('blur') }
    // !base_types
    add(type: string) {
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