import { Cell } from "./cell"
import { Callback } from "./d"
import { CellTree } from "./utils"


const scripts = {
    event: (query: string, event: string, callback: Callback) => `HIVECRAFT_WORKER.$on_event('${query}', '${event}', ${callback})`,
    pure: (name: string, callback: Callback) => `HIVECRAFT_WORKER.pure['${name.replaceAll(/ /gm, '_')}'] = ${callback}`,
    proxy: (name: string, value: string | number | null) => `HIVECRAFT_WORKER.proxy['${name}']=${value}`,
}


export class CellWorker extends CellTree {
    worker_cells: string[] = []
    constructor() { super() }
    empty(): boolean {
        return this.worker_cells.length == 0
    }

    join() { return this.worker_cells.join('') }

    generate(): Cell {
        const script = new Cell('script')
        script.text(this.join())
        return script
    }

    #worker_cells_push_wrapper(script: string) {
        this.worker_cells.push(`(() => {${script}})();`)
    }

    event(event: string, callback: Callback) {
        const script = scripts.event(this.query, event, callback)
        this.#worker_cells_push_wrapper(script)
        return this
    }

    pure(name: string, callback: Callback) {
        const script = scripts.pure(name, callback)
        this.#worker_cells_push_wrapper(script)
        return this
    }

    proxy(name: string, proxy: string | number | null = null): CellWorker {
        const script = scripts.proxy(name, proxy)
        this.#worker_cells_push_wrapper(script)
        return this
    }

    copy(): CellWorker {
        const worker_copy = new CellWorker()
        worker_copy.worker_cells = [...this.worker_cells];

        return worker_copy
    }
}