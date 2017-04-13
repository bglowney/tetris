"use strict";
const PieceModel_1 = require("./PieceModel");
const BlockModel_1 = require("./BlockModel");
class SPieceBlockModel extends PieceModel_1.PieceModel {
    constructor(initX, initY) {
        super();
        this.anchor = new BlockModel_1.BlockModel(initX + 1, initY + 1);
        this.blocks.push(this.anchor);
        this.blocks.push(new BlockModel_1.BlockModel(initX + 1, initY));
        this.blocks.push(new BlockModel_1.BlockModel(initX, initY + 1));
        this.blocks.push(new BlockModel_1.BlockModel(initX, initY + 2));
    }
}
exports.SPieceBlockModel = SPieceBlockModel;
