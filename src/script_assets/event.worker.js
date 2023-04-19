
class Tree {
    tree = {}
    proxy = {}
    constructor(){}
}

class Worker extends Tree{
    constructor(){
        super()
    }
    init(){

    }
    $on_event(query, event, callback){
        self.addEventListener(event, () => {
            callback({
                self: document.querySelector(query),
                item: this.tree[query],
                proxy: this.proxy[query]
            })
        })
    }
}

const CARBEE_WORKER = new Worker()

window.onload = () => {
    CARBEE_WORKER.init()
}