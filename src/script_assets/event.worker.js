
class Tree{
    tree = {}
    constructor(){}
}

class Worker extends Tree{
    constructor(){
        super()
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