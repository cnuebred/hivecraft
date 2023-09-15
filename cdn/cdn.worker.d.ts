export type WorkerCallback = (cog: any) => void;
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
export declare class HivecraftForm {
    form: HTMLElement;
    fields: {
        [index: string]: HTMLElement;
    };
    proxy: any;
    constructor(form: HTMLElement);
    private init;
    to_object(): object;
    fetch(url: string, headers?: object, data?: object, options?: object): Promise<Response>;
    reset(): void;
}
export declare class HivecraftTable {
    carbee_table: HTMLElement;
    table: HTMLElement;
    constructor(table: HTMLElement);
    init(): void;
    find(row: number, column: number): HTMLElement | null;
    get(row: number, column: number): string | null;
    set(row: number, column: number, value: string | number | null): void;
    add_column(for_rows?: number[]): void;
    add_row(): void;
    get_headers(): (string | null)[];
    to_object(): object[];
    from_object(data: object[]): void;
    clear_table(): void;
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
