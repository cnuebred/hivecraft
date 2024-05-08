import { Cell } from "./cell"
import { WorkerCallback } from "./d"
import { CellTree } from "./utils"


const scripts = {
    event: (query: string, event: string, callback: WorkerCallback) =>
        `HIVECRAFT_WORKER.$on_event('${query}', '${event}', ${callback})`,
    pure: (query: string, name: string, callback: WorkerCallback) =>
        `HIVECRAFT_WORKER.$pure('${query}','${name.replaceAll(/ /gm, '_')}', ${callback})`,
    proxy: (name: string, value: string | boolean | number | null, json: boolean) =>
        `HIVECRAFT_WORKER.$proxy('${name.replaceAll(/ /gm, '_')}', ${value}, ${json})`,
}


export class CellWorker extends CellTree {
    worker_cells: string[] = []
    imports_list: { local: string, href: string, async: boolean, file: boolean }[] = []
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

    push_import(key: string, path: string, async: boolean = true, file: boolean = true): CellTree {
        this.imports_list.push({ local: key, href: path, async, file })
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
    //sub events
    click(callback: WorkerCallback) {
        return this.event('click', callback)
    }

    pure(name: string, callback: WorkerCallback) {
        const script = scripts.pure(this.query, name, callback)
        this.#worker_cells_push_wrapper(script)
        return this
    }

    proxy(name: string, proxy: string | boolean | number | null = null, json: boolean = false): CellWorker {
        if (typeof proxy == 'string') proxy = json ? `'${proxy}'` : `"${proxy}"`
        const script = scripts.proxy(name, proxy, json)
        this.#worker_cells_push_wrapper(script)
        return this
    }

    onload(name: string, callback: WorkerCallback) {
        return this.pure('onload_' + name, callback)
    }

    copy(): CellWorker {
        const worker_copy = new CellWorker()
        worker_copy.worker_cells = [...this.worker_cells];
        worker_copy.imports_list = [...this.imports_list];

        return worker_copy
    }
}