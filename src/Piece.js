"use strict";
const index_1 = require("../node_modules/taco-bell/index");
const BlockModel_1 = require("./BlockModel");
class Piece {
    constructor(pieceModel) {
        this.blocks = [];
        let color = Piece.randomColor();
        for (let blockModel of pieceModel.blocks) {
            let blockComponent = new index_1.SVGComponent("rect")
                .withAttribute("x", blockModel.x)
                .withAttribute("y", blockModel.y)
                .withAttribute("width", BlockModel_1.BlockModel.SIDE_LENGTH)
                .withAttribute("height", BlockModel_1.BlockModel.SIDE_LENGTH)
                .withAttribute("style", "stroke: #000000; fill: " + color + ";")
                .reinit();
            blockModel.bindComponent(blockComponent);
            this.blocks.push(blockComponent);
        }
    }
    static randomColor() {
        return Piece.COLORS[Math.floor((Math.random() * (Piece.COLORS.length)))];
    }
}
Piece.COLORS = ['#FFAA55', '#AAFF55', '#AA55FF', '#FF55AA', '#55FFAA', '#55AAFF'];
exports.Piece = Piece;
