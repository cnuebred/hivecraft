type WorkerCallback = (cog: any) => void;
declare class Tree {
    tree: {};
    data: {
        proxy: {};
        refs: {};
        params: {};
    };
    ext: {
        form: {};
        table: {};
        imports: {};
    };
    constructor();
}
export declare class CoreWorker extends Tree {
    constructor();
    private set_imports;
    private set_refs;
    private set_forms;
    private set_table;
    private set_params;
    init(): CoreWorker;
    $on_event(query: string, event: string, callback: WorkerCallback): void;
}
export {};
