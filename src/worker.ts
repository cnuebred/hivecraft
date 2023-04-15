import { EventType, HashType, QueryType } from "./d"

export class BrickWorker {
    hash: HashType
    query: QueryType
    events: EventType[]
    constructor(){}
    replace(){}
    global(){}
    event(){}
    callback(callback: (cog: any) => void): BrickWorker{
        return this
    }
    render(): string{
        return ''
    }
}