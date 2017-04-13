"use strict";
const PieceModel_1 = require("./PieceModel");
const BlockModel_1 = require("./BlockModel");
class LongPieceModel extends PieceModel_1.PieceModel {
    constructor(initX, initY) {
        super();
        this.anchor = new BlockModel_1.BlockModel(initX, initY + 2);
        this.blocks.push(this.anchor);
        this.blocks.push(new BlockModel_1.BlockModel(initX, initY + 1));
        this.blocks.push(new BlockModel_1.BlockModel(initX, initY));
        this.blocks.push(new BlockModel_1.BlockModel(initX, initY + 3));
    }
}
exports.LongPieceModel = LongPieceModel;
