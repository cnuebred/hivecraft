
type EventCallback = (cog: any) => void

class Tree {
    tree = {}
    proxy = {}
    refs = {}
    imports = {}
    constructor(){}
}

class CoreWorker extends Tree{
    constructor(){
        super()
    }
    private set_imports(){
        const items = document.querySelectorAll('script[ref_href_lib]')
        items.forEach(item => {
            this.imports[item.getAttribute('ref_href_lib') || ''] = window[item.getAttribute('name_href_lib') || '']
        })
    }
    private deep_proxy(container, callback){
        const handler:ProxyHandler<Object> = {
            get: (target, prop, receiver) => {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value == 'object' && value !== null) {
                  return this.deep_proxy(value, callback);
                }
                return value;
            },
            set: (target, prop, receiver) => {
                target[prop] = receiver
                callback(container, target, prop, receiver)
                return true
            }
        }
        return new Proxy(this.proxy, handler)
    }
    private proxy_callback = (container, target, prop, receiver) => {
        const items = document.querySelectorAll(`[proxy_data="${prop}"]`)
        items.forEach(item => {// TODO create tree separated by dots
            //this.proxy[item.getAttribute('proxy_data') || ''] = target
            item.textContent = this.proxy[item.getAttribute('proxy_data') || '']
        })
    }
    private set_refs(){
        const items = document.querySelectorAll('[ref]')
        items.forEach(item => {
            this.refs[item.getAttribute('ref') || ''] = item
        })
    }
    init(): CoreWorker{
        this.set_imports()
        this.set_refs()
        this.proxy = this.deep_proxy(this.proxy, this.proxy_callback)
        return this
    }
    $on_event(query:string, event:string, callback: EventCallback){
        const self = document.querySelector(query) 
        if(!this.tree[query])
            this.tree[query] = {}
        self?.addEventListener(event, () => {
            callback({
                self,
                item: this.tree[query],
                proxy: this.proxy,
                refs: this.refs,
                imports: this.imports
            })
        })
    }
}

export const CARBEE_WORKER = new CoreWorker().init()

window.onload = () => {
    
}
