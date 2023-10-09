type WorkerCallback = (cog: any, eve?: Event) => void;
declare class Tree {
    tree: {};
    data: {
        pure: {};
        proxy: {};
        refs: {};
        params: {};
    };
    ext: {
        form: {};
        table: {};
    };
    imports: {};
    constructor();
}
export declare class CoreWorker extends Tree {
    constructor();
    private render_cog;
    private proxy_callback;
    private set_conditions;
    private set_imports;
    private set_refs;
    private set_forms;
    private set_table;
    private set_params;
    before_start(): CoreWorker;
    after_start(): CoreWorker;
    $on_event(query: string, event: string, callback: WorkerCallback): void;
    $pure(query: string, name: string, callback: WorkerCallback): void;
    $proxy(name: string, value: string | boolean | number | null, json: boolean): void;
}
export {};
