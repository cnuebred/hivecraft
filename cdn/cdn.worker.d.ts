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
        form: any;
        table: any;
        templates: {
            [index: string]: HivecraftTemplate;
        };
    };
    imports: {};
    constructor();
}
declare class HivecraftTemplate {
    base: HTMLElement;
    parent: HTMLElement;
    template: HTMLElement;
    hivecraft: CoreWorker;
    proxy: any;
    refer: string;
    proxy_name: string;
    last_section: number;
    hooked: boolean;
    contains_hooks: string[];
    children: {
        [index: string]: HivecraftTemplate;
    };
    events: any;
    constructor(base: HTMLElement, self: any);
    setup(): void;
    render_all(): void;
    replace_in_template(ref_item: any, template: any, replacer?: {
        [index: string]: any;
    } | string | number | null): void;
    set_template_event(element: any, template: any): Promise<void>;
    single_template(element: HTMLElement, template: any, replacer?: {
        [index: string]: any;
    } | string | number | null): void;
    create_single_template(template: HTMLElement, replacer?: {
        [index: string]: any;
    } | string | number | null, callback?: null | ((element: HTMLElement) => void)): HTMLElement;
    get_template(base: any): HTMLElement;
    render(parent: string, prop: string): void;
}
export declare class CoreWorker extends Tree {
    constructor();
    private render_cog;
    private proxy_callback_render_list;
    private proxy_callback;
    private set_conditions;
    private set_imports;
    private set_refs;
    private set_forms;
    private set_templates;
    private set_table;
    private set_params;
    before_start(): CoreWorker;
    after_start(): CoreWorker;
    $on_event(query: string | HTMLElement, event: string, callback: WorkerCallback, save?: boolean): void;
    $pure(query: string, name: string, callback: WorkerCallback): void;
    $proxy(name: string, value: string | boolean | number | null, json: boolean): void;
}
export {};
