import { Cell } from "./cell"
import { WorkerCallback } from "./d"
import { CellTree } from "./utils"


const scripts = {
    event: (query: string, event: string, callback: WorkerCallback) => `HIVECRAFT_WORKER.$on_event('${query}', '${event}', ${callback})`,
    pure: (name: string, callback: WorkerCallback) => `HIVECRAFT_WORKER.pure['${name.replaceAll(/ /gm, '_')}'] = ${callback}`,
    proxy: (name: string, value: string | number | null) => `HIVECRAFT_WORKER.proxy['${name}']=${value}`,
}


export class CellWorker extends CellTree {
    worker_cells: string[] = []
    imports_list: {local: string, href: string, async: boolean}[] = []
    constructor() { super() }
    empty(): boolean {
        return this.worker_cells.length == 0 && this.imports_list.length == 0;
    }

    join() { return this.worker_cells.join('') }

    generate(): Cell {
        const script = new Cell('script')
        script.text(this.join())
        return script
    }

    push_import(key: string, path: string, async: boolean = true): CellTree {
        this.imports_list.push({ local: key, href: path, async})
        return this
    }

    #worker_cells_push_wrapper(script: string) {
        this.worker_cells.push(`(() => {${script}})();`)
    }

    event(event: string, callback: WorkerCallback) {
        const script = scripts.event(this.query, event, callback)
        this.#worker_cells_push_wrapper(script)
        return this
    }

    pure(name: string, callback: WorkerCallback) {
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