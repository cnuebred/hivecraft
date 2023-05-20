import { Cell } from "./cell"
import { QueryType } from "./d"

export class CellTree{
    private _query: QueryType
    private _owner: Cell
    constructor(){}
    set query(value: QueryType) { this._query = value }
    get query() { return this._query }

    set owner(value: Cell) { this._owner = value }
    get owner() { return this._owner }
}
