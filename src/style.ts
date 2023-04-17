import { BrickTree } from "./core";
import { CSSList, QueryType } from "./d";

class BrickStyleEntity {
    constructor(query: QueryType, g: CSSList) {
        //TODO
    }
}

export class BrickStyle extends BrickTree {
    styles: BrickStyleEntity[]
    constructor() { super() }
    copy(): BrickStyle {
        const style_copy = new BrickStyle()
        return style_copy
    }
}