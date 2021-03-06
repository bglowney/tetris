/*
 block arrangement:

 i B
 D A C

 where A is anchor, and i is init

 */
import {PieceModel} from "./PieceModel";
import {BlockModel} from "./BlockModel";
export class PyramdPieceModel extends PieceModel {

    constructor(initX: number, initY: number) {
        super();
        this.anchor = new BlockModel(initX + 1, initY + 1);
        this.blocks.push(this.anchor);
        this.blocks.push(new BlockModel(initX + 1, initY));
        this.blocks.push(new BlockModel(initX + 2, initY + 1));
        this.blocks.push(new BlockModel(initX, initY + 1));
    }

}