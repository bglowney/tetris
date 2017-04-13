"use strict";
const index_1 = require("../node_modules/taco-bell/index");
class BlockModel extends index_1.ModelElement {
    constructor(x, y) {
        super();
        this.x = new index_1.ModelElement(x * BlockModel.SIDE_LENGTH);
        this.y = new index_1.ModelElement(y * BlockModel.SIDE_LENGTH);
    }
}
BlockModel.SIDE_LENGTH = 25;
exports.BlockModel = BlockModel;
