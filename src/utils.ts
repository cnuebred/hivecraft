import { QueryType } from "./d"

export class BrickTree{
    private _query: QueryType
    constructor(){}
    set query(value: QueryType) { this._query = value }
    get query() { return this._query }
}
