(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var AbstractComponent_1 = require("./src/AbstractComponent");
exports.AbstractComponent = AbstractComponent_1.AbstractComponent;
var AbstractElement_1 = require("./src/AbstractElement");
exports.AbstractElement = AbstractElement_1.AbstractElement;
var Binding_1 = require("./src/Binding");
exports.Binding = Binding_1.Binding;
exports.persist = Binding_1.persist;
exports.persistentModel = Binding_1.persistentModel;
exports.Persistence = Binding_1.Persistence;
exports.TwoWayBinding = Binding_1.TwoWayBinding;
var Collection_1 = require("./src/Collection");
exports.Collection = Collection_1.Collection;
var Component_1 = require("./src/Component");
exports.Component = Component_1.Component;
var FunctionalComponent_1 = require("./src/FunctionalComponent");
exports.FunctionalElement = FunctionalComponent_1.FunctionalElement;
var ModelArray_1 = require("./src/ModelArray");
exports.ModelArray = ModelArray_1.ModelArray;
var ModelCollection_1 = require("./src/ModelCollection");
exports.ModelCollection = ModelCollection_1.ModelCollection;
var ModelElement_1 = require("./src/ModelElement");
exports.ModelElement = ModelElement_1.ModelElement;
var SVGCollection_1 = require("./src/SVGCollection");
exports.SVGCollection = SVGCollection_1.SVGCollection;
var SVGComponent_1 = require("./src/SVGComponent");
exports.SVGComponent = SVGComponent_1.SVGComponent;

},{"./src/AbstractComponent":2,"./src/AbstractElement":3,"./src/Binding":4,"./src/Collection":5,"./src/Component":6,"./src/FunctionalComponent":7,"./src/ModelArray":8,"./src/ModelCollection":9,"./src/ModelElement":10,"./src/SVGCollection":11,"./src/SVGComponent":12}],2:[function(require,module,exports){
"use strict";
const Binding_1 = require("./Binding");
const ModelElement_1 = require("./ModelElement");
class AbstractComponent {
    constructor(tagName, parent, namespace) {
        if (!namespace)
            this.element = document.createElement(tagName || "div");
        else
            this.element = document.createElementNS(namespace, tagName);
        if (parent != undefined) {
            this.parent = parent;
            parent.appendChild(this.element);
        }
    }
    getElement() {
        return this.element;
    }
    setElement(element) {
        this.element = element;
    }
    setParent(parent) {
        this.parent = parent;
    }
    reinit() {
        this.updateClass();
        this.updateText();
        if (this.attrs) {
            for (let name in this.attrs) {
                this.updateAttribute(name);
            }
        }
        this.updateValue();
        return this;
    }
    destroy() {
        this.element.parentElement.removeChild(this.element);
    }
    withClass(...classes) {
        if (!this.classes)
            this.classes = new Set();
        for (let cls of classes) {
            this.classes.add(cls);
            if (cls instanceof ModelElement_1.ModelElement)
                cls.registerCallback(this, this.withClass.bind(this));
            else if (cls instanceof Binding_1.Binding) {
                let binding = cls;
                binding.model.registerCallback(this, this.updateClass.bind(this));
            }
        }
        return this;
    }
    updateClass() {
        if (!this.classes)
            return;
        let classNames = [];
        for (let cp of this.classes.values()) {
            if (typeof cp == "string") {
                classNames.push(cp);
            }
            else if (cp instanceof ModelElement_1.ModelElement) {
                classNames.push(cp.get());
            }
            else {
                let binding = cp;
                classNames.push(binding.onupdate(binding.model.get()));
            }
        }
        this.element.className = classNames.join(" ");
    }
    removeClass(...classes) {
        if (this.classes) {
            for (let cls of classes) {
                if (cls instanceof ModelElement_1.ModelElement) {
                    cls.unregisterCallback(this, this.updateClass.bind(this));
                }
                else if (cls instanceof Binding_1.Binding) {
                    let binding = cls;
                    binding.model.unregisterCallback(this, this.updateClass.bind(this));
                }
                this.classes.delete(cls);
            }
        }
        return this;
    }
    withText(text) {
        this.text = text;
        if (text instanceof ModelElement_1.ModelElement) {
            text.registerCallback(this, this.updateText.bind(this));
        }
        else if (this.text instanceof Binding_1.Binding) {
            let binding = text;
            binding.model.registerCallback(this, this.updateText.bind(this));
        }
        return this;
    }
    updateText() {
        if (this.text != undefined) {
            let text;
            if (typeof this.text == "string")
                text = this.text;
            else if (this.text instanceof ModelElement_1.ModelElement) {
                text = this.text.get();
            }
            else {
                let binding = this.text;
                text = binding.onupdate(binding.model.get());
            }
            this.element.textContent = text;
        }
    }
    removeText() {
        if (this.text != undefined) {
            if (this.text instanceof ModelElement_1.ModelElement)
                this.text.unregisterCallback(this, this.updateText.bind(this));
            else if (this.text instanceof Binding_1.Binding) {
                let binding = this.text;
                binding.model.unregisterCallback(this, this.updateText.bind(this));
            }
        }
        this.text = "";
        this.updateText();
        return this;
    }
    withValue(value) {
        this.value = value;
        let valueProp;
        function setInputType() {
            let inputType = this.element.getAttribute("type");
            valueProp = inputType == "checkbox" || inputType == "radio" ? "checked" : "value";
        }
        if (value instanceof ModelElement_1.ModelElement) {
            value.registerCallback(this, this.updateValue.bind(this));
            this.element.onchange = function () {
                setInputType.call(this);
                value.set(this.element[valueProp]);
            }.bind(this);
        }
        else if (this.value instanceof Binding_1.TwoWayBinding) {
            let binding = value;
            binding.model.registerCallback(this, this.updateValue.bind(this));
            this.element.onchange = function () {
                setInputType.call(this);
                binding.model.set(binding.onUserUpdate(this.element[valueProp]));
            }.bind(this);
        }
        return this;
    }
    removeValue() {
        if (this.value != undefined) {
            if (this.value instanceof ModelElement_1.ModelElement) {
                this.value.unregisterCallback(this, this.updateValue.bind(this));
            }
            else if (this.value instanceof Binding_1.Binding) {
                let binding = this.value;
                binding.model.unregisterCallback(this, this.updateValue.bind(this));
            }
        }
        let valueProp = this.element.getAttribute("type") == "checkbox" || this.element.getAttribute("type") == "radio" ? "checked" : "value";
        this.element[valueProp] = "";
        this.element.onchange = null;
        return this;
    }
    updateValue() {
        if (this.value != undefined) {
            let value;
            let valueProp = this.element.getAttribute("type") == "checkbox" || this.element.getAttribute("type") == "radio" ? "checked" : "value";
            if (!(typeof this.value == "object")) {
                value = this.value;
            }
            else if (this.value instanceof ModelElement_1.ModelElement) {
                value = this.value.get();
            }
            else {
                let binding = this.value;
                value = binding.onupdate(binding.model.get());
            }
            this.element[valueProp] = value;
        }
    }
    withAttribute(name, value) {
        if (!this.attrs)
            this.attrs = {};
        this.attrs[name] = value;
        if (value instanceof ModelElement_1.ModelElement) {
            value.registerCallback(this, this.updateAttribute.bind(this, name));
        }
        else if (value instanceof Binding_1.Binding) {
            let binding = value;
            binding.model.registerCallback(this, this.updateAttribute.bind(this, name));
        }
        return this;
    }
    removeAttribute(name) {
        if (this.attrs != undefined) {
            if (this.attrs[name] != undefined) {
                let value = this.attrs[name];
                if (value instanceof ModelElement_1.ModelElement) {
                    value.unregisterCallback(this, this.updateAttribute.bind(this, name));
                }
                else {
                    let binding = value;
                    binding.model.unregisterCallback(this, this.updateAttribute.bind(this, name));
                }
                delete this.attrs[name];
                this.element.removeAttribute(name);
            }
        }
        return this;
    }
    updateAttribute(name) {
        if (this.attrs) {
            if (this.attrs[name] != undefined) {
                let value = this.attrs[name];
                if (value instanceof ModelElement_1.ModelElement) {
                    value = value.get();
                }
                else if (value instanceof Binding_1.Binding) {
                    let binding = value;
                    value = binding.onupdate(binding.model.get());
                }
                this.element.setAttribute(name, value);
            }
        }
    }
    on(eventName, eventHandler) {
        this.element.addEventListener(eventName, eventHandler.bind(this));
        return this;
    }
    off(eventName) {
        this.element.removeEventListener(eventName);
        return this;
    }
    focus() {
        this.element.focus();
        return this;
    }
    hide() {
        this.element.classList.add("hidden");
        return this;
    }
    show() {
        this.element.classList.remove("hidden");
        return this;
    }
}
exports.AbstractComponent = AbstractComponent;

},{"./Binding":4,"./ModelElement":10}],3:[function(require,module,exports){
"use strict";
class AbstractElement {
    destroy() {
        if (!this.boundComponents)
            return;
        for (let component of this.boundComponents.values())
            component.destroy();
    }
    bindComponent(component) {
        if (!this.boundComponents) {
            this.boundComponents = new Set();
        }
        this.boundComponents.add(component);
    }
    registerCallback(component, updateCallback) {
        if (!this.updateCallbacks)
            this.updateCallbacks = new Map();
        let callbackSet = this.updateCallbacks.get(component);
        if (callbackSet == undefined) {
            callbackSet = new Set();
            this.updateCallbacks.set(component, callbackSet);
        }
        callbackSet.add(updateCallback);
    }
    unregisterCallback(component, callback) {
        if (!this.updateCallbacks)
            return;
        if (!callback)
            this.updateCallbacks.delete(component);
        else if (this.updateCallbacks.has(component)) {
            let set = this.updateCallbacks.get(component);
            if (set)
                set.delete(callback);
        }
    }
    doUpdate() {
        if (!this.updateCallbacks)
            return;
        for (let callbackSet of this.updateCallbacks.values()) {
            for (let callback of callbackSet.values())
                callback(this.get());
        }
    }
}
exports.AbstractElement = AbstractElement;

},{}],4:[function(require,module,exports){
"use strict";
const ModelElement_1 = require("./ModelElement");
const ModelArray_1 = require("./ModelArray");
class Binding {
    constructor(model, onupdate) {
        this.model = model;
        this.onupdate = onupdate;
    }
}
exports.Binding = Binding;
class TwoWayBinding extends Binding {
    constructor(model, onModelUpdate, onUserUpdate) {
        super(model, onModelUpdate);
        this.onUserUpdate = onUserUpdate;
    }
}
exports.TwoWayBinding = TwoWayBinding;
class _Persistence {
    store() {
        window.sessionStorage.setItem("model", this.model.serialize());
    }
    get() {
        return window.sessionStorage.getItem("model");
    }
    hasModel() {
        return window.sessionStorage.getItem("model") != undefined;
    }
}
exports.Persistence = new _Persistence();
function makeModelPersistent() {
    for (let member in this) {
        if (this[member] instanceof ModelElement_1.ModelElement) {
            let modelElement = this[member];
            modelElement.set = function (a, b) {
                ModelElement_1.ModelElement.prototype.set.call(modelElement, a, b);
                exports.Persistence.store();
            };
        }
        if (this[member] instanceof ModelArray_1.ModelArray) {
            let modelArray = this[member];
            modelArray.add = function (a) {
                ModelArray_1.ModelArray.prototype.add.call(modelArray, a);
                exports.Persistence.store();
                return modelArray;
            };
            modelArray.remove = function (a) {
                ModelArray_1.ModelArray.prototype.remove.call(modelArray, a);
                exports.Persistence.store();
                return modelArray;
            };
        }
    }
}
function persistentModel(constructor) {
    return function (a, b, c, d, e, f) {
        exports.Persistence.emptyModel = constructor;
        let original;
        if (exports.Persistence.hasModel()) {
            original = constructor.prototype.deserialize(new exports.Persistence.emptyModel(), exports.Persistence.get());
        }
        else {
            original = new constructor(a, b, c, d, e, f);
        }
        Object.assign(this, original);
        this.__proto__ = original.__proto__;
        exports.Persistence.model = this;
        makeModelPersistent.call(this);
    };
}
exports.persistentModel = persistentModel;
function persist(constructor) {
    return function (a, b, c, d, e, f) {
        let original = new constructor(a, b, c, d, e, f);
        Object.assign(this, original);
        this.__proto__ = original["__proto__"];
        makeModelPersistent.call(this);
    };
}
exports.persist = persist;

},{"./ModelArray":8,"./ModelElement":10}],5:[function(require,module,exports){
"use strict";
const AbstractComponent_1 = require("./AbstractComponent");
const ModelArray_1 = require("./ModelArray");
class Collection extends AbstractComponent_1.AbstractComponent {
    children(model, onAddCallback) {
        model.registerAddCallback(this, function (newItem) {
            let i = model instanceof ModelArray_1.ModelArray ? model.size.get() : "";
            let newComponent = onAddCallback(newItem, i);
            newItem.bindComponent(newComponent);
            this.element.appendChild(newComponent.getElement());
        }.bind(this));
        return this;
    }
}
exports.Collection = Collection;

},{"./AbstractComponent":2,"./ModelArray":8}],6:[function(require,module,exports){
"use strict";
const AbstractComponent_1 = require("./AbstractComponent");
class Component extends AbstractComponent_1.AbstractComponent {
    child(x) {
        let components;
        if (x instanceof Array)
            components = x;
        else
            components = Array.prototype.slice.call(arguments);
        for (let component of components) {
            component.setParent(this);
            this.element.appendChild(component.getElement());
        }
        return this;
    }
}
exports.Component = Component;

},{"./AbstractComponent":2}],7:[function(require,module,exports){
"use strict";
const AbstractElement_1 = require("./AbstractElement");
class FunctionalElement extends AbstractElement_1.AbstractElement {
    constructor(handler, ...listenedTo) {
        super();
        this.handler = handler;
        this.listenedTo = listenedTo || [];
        for (let model of this.listenedTo)
            model.registerCallback(model, this.doUpdate.bind(this));
    }
    get() {
        return this.handler.apply(this.handler, this.listenedTo.map(function (model) {
            return model.get();
        }));
    }
    subscribe(remoteStream) {
        throw "Not implemented";
    }
}
exports.FunctionalElement = FunctionalElement;

},{"./AbstractElement":3}],8:[function(require,module,exports){
"use strict";
const ModelCollection_1 = require("./ModelCollection");
const ModelElement_1 = require("./ModelElement");
class ModelArray extends ModelCollection_1.ModelCollection {
    constructor(data) {
        super([]);
        this.size = new ModelElement_1.ModelElement(0);
        if (data) {
            for (let item of data) {
                this.add(item);
            }
        }
    }
    add(member) {
        if (!this.addCallbacks)
            this.addCallbacks = new Map();
        let newMember = new ModelElement_1.ModelElement(member);
        this.data.push(newMember);
        const index = this.data.length - 1;
        for (let callbackSet of this.addCallbacks.values()) {
            for (let callback of callbackSet.values()) {
                callback(newMember, index);
            }
        }
        this.size.set(this.size.get() + 1);
        return this;
    }
    remove(member) {
        let index = this.data.indexOf(member);
        if (index !== -1) {
            member.destroy();
            this.data.splice(index, 1);
        }
        this.size.set(this.size.get() - 1);
        return this;
    }
    clear() {
        while (this.data.length > 0)
            this.remove(this.data[0]);
        return this;
    }
    subscribe(remoteStream) {
        throw "Not implemented";
    }
}
exports.ModelArray = ModelArray;

},{"./ModelCollection":9,"./ModelElement":10}],9:[function(require,module,exports){
"use strict";
const ModelElement_1 = require("./ModelElement");
class ModelCollection extends ModelElement_1.ModelElement {
    registerAddCallback(component, addCallback) {
        if (!this.addCallbacks)
            this.addCallbacks = new Map();
        let callbackSet = this.addCallbacks.get(component);
        if (callbackSet == undefined) {
            callbackSet = new Set();
            this.addCallbacks.set(component, callbackSet);
        }
        callbackSet.add(addCallback);
    }
    unregisterCallback(component, callback) {
        if (!this.addCallbacks)
            return;
        if (!callback)
            this.addCallbacks.delete(component);
        else if (this.addCallbacks.has(component)) {
            let set = this.addCallbacks.get(component);
            if (set)
                set.delete(callback);
        }
    }
}
exports.ModelCollection = ModelCollection;

},{"./ModelElement":10}],10:[function(require,module,exports){
"use strict";
const AbstractElement_1 = require("./AbstractElement");
class ModelElement extends AbstractElement_1.AbstractElement {
    constructor(data) {
        super();
        this.data = data;
    }
    get() {
        return this.data;
    }
    set(data, doUpdate = true) {
        this.data = data;
        if (doUpdate)
            this.doUpdate();
    }
    subscribe(remoteStream) {
        throw "Not Implemented";
    }
}
exports.ModelElement = ModelElement;

},{"./AbstractElement":3}],11:[function(require,module,exports){
"use strict";
const Collection_1 = require("./Collection");
const ModelElement_1 = require("./ModelElement");
class SVGCollection extends Collection_1.Collection {
    constructor(tagName, parent) {
        super(tagName, parent, "http://www.w3.org/2000/svg");
    }
    updateClass() {
        if (!this.classes)
            return;
        let classNames = [];
        for (let cp of this.classes.values()) {
            if (typeof cp == "string") {
                classNames.push(cp);
            }
            else if (cp instanceof ModelElement_1.ModelElement) {
                classNames.push(cp.get());
            }
            else {
                let binding = cp;
                classNames.push(binding.onupdate(binding.model.get()));
            }
        }
        this.element.setAttribute("class", classNames.join(" "));
    }
    withWidth(width) {
        return this.withAttribute("width", width);
    }
    withHeight(height) {
        return this.withAttribute("height", height);
    }
    withX(x) {
        return this.withAttribute("x", x);
    }
    withY(y) {
        return this.withAttribute("y", y);
    }
}
exports.SVGCollection = SVGCollection;

},{"./Collection":5,"./ModelElement":10}],12:[function(require,module,exports){
"use strict";
const Component_1 = require("./Component");
const ModelElement_1 = require("./ModelElement");
class SVGComponent extends Component_1.Component {
    constructor(tagName, parent) {
        super(tagName, parent, "http://www.w3.org/2000/svg");
    }
    updateClass() {
        if (!this.classes)
            return;
        let classNames = [];
        for (let cp of this.classes.values()) {
            if (typeof cp == "string") {
                classNames.push(cp);
            }
            else if (cp instanceof ModelElement_1.ModelElement) {
                classNames.push(cp.get());
            }
            else {
                let binding = cp;
                classNames.push(binding.onupdate(binding.model.get()));
            }
        }
        this.element.setAttribute("class", classNames.join(" "));
    }
    withWidth(width) {
        return this.withAttribute("width", width);
    }
    withHeight(height) {
        return this.withAttribute("height", height);
    }
    withX(x) {
        return this.withAttribute("x", x);
    }
    withY(y) {
        return this.withAttribute("y", y);
    }
}
exports.SVGComponent = SVGComponent;

},{"./Component":6,"./ModelElement":10}],13:[function(require,module,exports){
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

},{"../node_modules/taco-bell/index":1}],14:[function(require,module,exports){
"use strict";
const PieceModel_1 = require("./PieceModel");
const BlockModel_1 = require("./BlockModel");
class LPieceModel extends PieceModel_1.PieceModel {
    constructor(initX, initY) {
        super();
        this.anchor = new BlockModel_1.BlockModel(initX, initY + 2);
        this.blocks.push(this.anchor);
        this.blocks.push(new BlockModel_1.BlockModel(initX, initY + 1));
        this.blocks.push(new BlockModel_1.BlockModel(initX, initY));
        this.blocks.push(new BlockModel_1.BlockModel(initX + 1, initY + 2));
    }
}
exports.LPieceModel = LPieceModel;

},{"./BlockModel":13,"./PieceModel":17}],15:[function(require,module,exports){
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

},{"./BlockModel":13,"./PieceModel":17}],16:[function(require,module,exports){
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

},{"../node_modules/taco-bell/index":1,"./BlockModel":13}],17:[function(require,module,exports){
"use strict";
const BlockModel_1 = require("./BlockModel");
const shared_1 = require("./shared");
class PieceModel {
    constructor() {
        this.blocks = [];
    }
    rotate() {
        function rotateBlockClockwise(acc, anchor, block) {
            let dy = block.y.get() - anchor.y.get();
            let dx = block.x.get() - anchor.x.get();
            let move = {
                block: block,
                x: anchor.x.get() + dy,
                y: anchor.y.get() - dx
            };
            acc.push(move);
            return move.x >= 0 && (move.x < shared_1.gameWidth * BlockModel_1.BlockModel.SIDE_LENGTH);
        }
        let moves = [];
        for (let block of this.blocks) {
            if (!rotateBlockClockwise(moves, this.anchor, block))
                return;
        }
        for (let move of moves) {
            move.block.x.set(move.x);
            move.block.y.set(move.y);
        }
    }
    move(tetris, direction) {
        let validMove = false;
        let grouped = {
            x: {},
            y: {}
        };
        for (let block of this.blocks) {
            let x = block.x.get();
            if (!grouped.x[x])
                grouped.x[x] = [];
            grouped.x[x].push(block);
            let y = block.y.get();
            if (!grouped.y[y])
                grouped.y[y] = [];
            grouped.y[y].push(block);
        }
        outter: switch (direction) {
            case shared_1.Direction.LEFT:
                if (grouped.x[0] == undefined) {
                    for (let block of this.blocks) {
                        let currentLine = tetris.lines[block.y.get()];
                        if (currentLine && currentLine.blocks[block.x.get() - BlockModel_1.BlockModel.SIDE_LENGTH])
                            break outter;
                    }
                    for (let block of this.blocks)
                        block.x.set(block.x.get() - BlockModel_1.BlockModel.SIDE_LENGTH);
                    validMove = true;
                }
                break;
            case shared_1.Direction.RIGHT:
                if (grouped.x[(BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameWidth) - BlockModel_1.BlockModel.SIDE_LENGTH] == undefined) {
                    for (let block of this.blocks) {
                        let currentLine = tetris.lines[block.y.get()];
                        if (currentLine && currentLine.blocks[block.x.get() + BlockModel_1.BlockModel.SIDE_LENGTH])
                            break outter;
                    }
                    for (let block of this.blocks)
                        block.x.set(block.x.get() + BlockModel_1.BlockModel.SIDE_LENGTH);
                    validMove = true;
                }
                break;
            case shared_1.Direction.DOWN:
                if (grouped.y[(BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameHeight) - BlockModel_1.BlockModel.SIDE_LENGTH] == undefined) {
                    for (let block of this.blocks) {
                        let lineBelow = tetris.lines[block.y.get() + BlockModel_1.BlockModel.SIDE_LENGTH];
                        if (lineBelow && lineBelow.blocks[block.x.get()])
                            break outter;
                    }
                    for (let block of this.blocks)
                        block.y.set(block.y.get() + BlockModel_1.BlockModel.SIDE_LENGTH);
                    validMove = true;
                }
                break;
            case (shared_1.Direction.AUTO_DOWN):
                while ((this.move(tetris, shared_1.Direction.DOWN))) { }
                break;
        }
        return validMove;
    }
}
exports.PieceModel = PieceModel;

},{"./BlockModel":13,"./shared":22}],18:[function(require,module,exports){
"use strict";
const PieceModel_1 = require("./PieceModel");
const BlockModel_1 = require("./BlockModel");
class PyramdPieceModel extends PieceModel_1.PieceModel {
    constructor(initX, initY) {
        super();
        this.anchor = new BlockModel_1.BlockModel(initX + 1, initY + 1);
        this.blocks.push(this.anchor);
        this.blocks.push(new BlockModel_1.BlockModel(initX + 1, initY));
        this.blocks.push(new BlockModel_1.BlockModel(initX + 2, initY + 1));
        this.blocks.push(new BlockModel_1.BlockModel(initX, initY + 1));
    }
}
exports.PyramdPieceModel = PyramdPieceModel;

},{"./BlockModel":13,"./PieceModel":17}],19:[function(require,module,exports){
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

},{"./BlockModel":13,"./PieceModel":17}],20:[function(require,module,exports){
"use strict";
const PieceModel_1 = require("./PieceModel");
const BlockModel_1 = require("./BlockModel");
class SquarePieceModel extends PieceModel_1.PieceModel {
    constructor(initX, initY) {
        super();
        this.anchor = new BlockModel_1.BlockModel(initX, initY);
        this.blocks.push(this.anchor);
        this.blocks.push(new BlockModel_1.BlockModel(initX + 1, initY));
        this.blocks.push(new BlockModel_1.BlockModel(initX + 1, initY + 1));
        this.blocks.push(new BlockModel_1.BlockModel(initX, initY + 1));
    }
    rotate() {
    }
}
exports.SquarePieceModel = SquarePieceModel;

},{"./BlockModel":13,"./PieceModel":17}],21:[function(require,module,exports){
"use strict";
const PieceModel_1 = require("./PieceModel");
const BlockModel_1 = require("./BlockModel");
class ZPieceBlockModel extends PieceModel_1.PieceModel {
    constructor(initX, initY) {
        super();
        this.anchor = new BlockModel_1.BlockModel(initX, initY + 1);
        this.blocks.push(this.anchor);
        this.blocks.push(new BlockModel_1.BlockModel(initX, initY));
        this.blocks.push(new BlockModel_1.BlockModel(initX + 1, initY + 1));
        this.blocks.push(new BlockModel_1.BlockModel(initX + 1, initY + 2));
    }
}
exports.ZPieceBlockModel = ZPieceBlockModel;

},{"./BlockModel":13,"./PieceModel":17}],22:[function(require,module,exports){
"use strict";
exports.gameWidth = 8;
exports.gameHeight = 15;
var Direction;
(function (Direction) {
    Direction[Direction["LEFT"] = 0] = "LEFT";
    Direction[Direction["DOWN"] = 1] = "DOWN";
    Direction[Direction["RIGHT"] = 2] = "RIGHT";
    Direction[Direction["AUTO_DOWN"] = 3] = "AUTO_DOWN";
})(Direction = exports.Direction || (exports.Direction = {}));

},{}],23:[function(require,module,exports){
"use strict";
const index_1 = require("../node_modules/taco-bell/index");
const Piece_1 = require("./Piece");
const BlockModel_1 = require("./BlockModel");
const shared_1 = require("./shared");
const SquarePieceModel_1 = require("./SquarePieceModel");
const SPieceModel_1 = require("./SPieceModel");
const ZPieceBlockModel_1 = require("./ZPieceBlockModel");
const LPieceModel_1 = require("./LPieceModel");
const LongPieceModel_1 = require("./LongPieceModel");
const index_2 = require("../node_modules/taco-bell/index");
const index_3 = require("../node_modules/taco-bell/index");
const index_4 = require("../node_modules/taco-bell/index");
const PyramidPieceModel_1 = require("./PyramidPieceModel");
const index_5 = require("../node_modules/taco-bell/index");
const LEFT_KEYCODE = 37;
const UP_KEYCODE = 38;
const RIGHT_KEYCODE = 39;
const DOWN_KEYCODE = 40;
const SPACE_KEYCODE = 32;
const P_KEYCODE = 80;
const S_KEYCODE = 83;
const PIECES_PER_LEVEL = 100;
const POINTS_PER_PIECE = 1;
const LEVEL_MULTIPLIER = 2;
const POINTS_PER_LINE = 10;
const LINE_MULTIPLIER = 2;
class LineModel {
    constructor() {
        this.blocks = {};
    }
    isComplete() {
        for (let x = 0; x < shared_1.gameWidth * BlockModel_1.BlockModel.SIDE_LENGTH; x += BlockModel_1.BlockModel.SIDE_LENGTH)
            if (!this.blocks[x])
                return false;
        return true;
    }
    clear() {
        for (let x in this.blocks) {
            let block = this.blocks[x];
            block.destroy();
        }
    }
}
var State;
(function (State) {
    State[State["INIT"] = 0] = "INIT";
    State[State["IN_PROGRESS"] = 1] = "IN_PROGRESS";
    State[State["PAUSED"] = 2] = "PAUSED";
    State[State["GAMEOVER"] = 3] = "GAMEOVER";
})(State || (State = {}));
class TetrisModel {
    constructor() {
        this.message = new index_3.ModelElement();
        this.showMessage = new index_3.ModelElement(false);
        this.state = new index_3.ModelElement(State.INIT);
        this.score = new index_3.ModelElement(0);
        this.pieceCount = new index_3.ModelElement(0);
        this.lineCount = new index_3.ModelElement(0);
        this.level = new index_5.FunctionalElement(function (pieceCount) {
            return Math.ceil((pieceCount + 1) / PIECES_PER_LEVEL);
        }, this.pieceCount);
        this.tickLength = new index_5.FunctionalElement(function (level) {
            return 1000 / Math.log2(level + 1);
        }, this.level);
    }
    resetCurrentPiece(tetris) {
        this.currentPiece = new TetrisModel.PIECES[Math.floor((Math.random() * (TetrisModel.PIECES.length)))]((shared_1.gameWidth / 2) - 1, 0);
        for (let block of this.currentPiece.blocks) {
            let line = tetris.lines[block.y.get()];
            if (line && line.blocks[block.x.get()])
                return false;
        }
        return true;
    }
}
TetrisModel.PIECES = [SquarePieceModel_1.SquarePieceModel, SPieceModel_1.SPieceBlockModel, ZPieceBlockModel_1.ZPieceBlockModel, LPieceModel_1.LPieceModel, LongPieceModel_1.LongPieceModel, PyramidPieceModel_1.PyramdPieceModel];
class Tetris {
    constructor() {
        this.lines = {};
        this.model = new TetrisModel();
        this.model.resetCurrentPiece(this);
        this.lastLine = new LineModel();
        document.addEventListener("keyup", (event) => {
            let state = this.model.state.get();
            switch (event.keyCode) {
                case LEFT_KEYCODE:
                    if (state == State.IN_PROGRESS)
                        this.model.currentPiece.move(this, shared_1.Direction.LEFT);
                    break;
                case RIGHT_KEYCODE:
                    if (state == State.IN_PROGRESS)
                        this.model.currentPiece.move(this, shared_1.Direction.RIGHT);
                    break;
                case DOWN_KEYCODE:
                    if (state == State.IN_PROGRESS)
                        this.model.currentPiece.move(this, shared_1.Direction.DOWN);
                    break;
                case UP_KEYCODE:
                    if (state == State.IN_PROGRESS)
                        this.model.currentPiece.rotate();
                    break;
                case SPACE_KEYCODE:
                    if (state == State.IN_PROGRESS)
                        this.model.currentPiece.move(this, shared_1.Direction.AUTO_DOWN);
                    break;
                case P_KEYCODE:
                    this.pause();
                    break;
            }
        });
        this.svg = new index_1.SVGComponent("svg")
            .withAttribute("width", BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameWidth)
            .withAttribute("height", BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameHeight)
            .child(new index_1.SVGComponent("rect")
            .withAttribute("x", 0)
            .withAttribute("y", 0)
            .withAttribute("width", BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameWidth)
            .withAttribute("height", BlockModel_1.BlockModel.SIDE_LENGTH * shared_1.gameHeight)
            .withAttribute("style", "fill: #000000;")
            .reinit())
            .reinit();
        new index_2.Component("div", document.getElementById("app-root"))
            .withClass("game")
            .child(new index_2.Component("div")
            .withClass("header")
            .child(new index_2.Component("span")
            .withClass("score"))
            .child(new index_2.Component("span")
            .withText("Start")
            .withClass("btn start", new index_4.Binding(this.model.state, function (state) {
            return state == State.INIT || state == State.GAMEOVER ? "" : "hidden";
        })).on("click", this.restart.bind(this))
            .reinit(), new index_2.Component("span")
            .withClass("level", new index_4.Binding(this.model.state, function (state) {
            return state == State.INIT || state == State.GAMEOVER ? "hidden" : "";
        }))
            .withText(new index_4.Binding(this.model.level, function (level) {
            return "Level " + level;
        }))
            .reinit(), new index_2.Component("label")
            .withClass("score")
            .withText(this.model.score)
            .reinit(), new index_2.Component("label")
            .withClass("line-count")
            .withText(this.model.lineCount)
            .reinit(), new index_2.Component("span")
            .withText(new index_4.Binding(this.model.state, function (state) {
            return state == State.PAUSED ? "Resume" : "Pause";
        }))
            .withClass("btn pause")
            .on("click", this.pause.bind(this))
            .reinit()).reinit()
            .child(new index_2.Component("h1")
            .withText(this.model.message)
            .withClass("message", new index_4.Binding(this.model.showMessage, function (showing) {
            return showing ? "" : "hidden";
        }))
            .reinit())).reinit()
            .child(this.svg)
            .reinit();
    }
    restart() {
        if (this.timeoutHandle)
            clearTimeout(this.timeoutHandle);
        this.model.state.set(State.IN_PROGRESS);
        if (this.model.currentPiece) {
            for (let block of this.model.currentPiece.blocks)
                block.destroy();
        }
        this.model.showMessage.set(false);
        this.model.score.set(0);
        this.model.lineCount.set(0);
        this.model.pieceCount.set(0);
        for (let y in this.lines) {
            let line = this.lines[y];
            if (line !== this.lastLine)
                this.lines[y].clear();
        }
        this.lines = {};
        this.lines[shared_1.gameHeight * BlockModel_1.BlockModel.SIDE_LENGTH] = this.lastLine;
        this.model.resetCurrentPiece(this);
        this.piece = new Piece_1.Piece(this.model.currentPiece);
        this.addPiece(this.piece);
        this.tick();
    }
    tick() {
        this.timeoutHandle = setTimeout(function () {
            for (let block of this.model.currentPiece.blocks) {
                if (!this.canFall(block)) {
                    this.releasePiece(this.model.currentPiece);
                    this.updateLines();
                    let gameEnded = !this.model.resetCurrentPiece(this);
                    this.piece = new Piece_1.Piece(this.model.currentPiece);
                    this.addPiece(this.piece);
                    if (gameEnded) {
                        this.endGame();
                        return;
                    }
                    this.tick();
                    return;
                }
            }
            this.model.currentPiece.move(this, shared_1.Direction.DOWN);
            this.tick();
        }.bind(this), this.model.tickLength.get());
    }
    pause() {
        let state = this.model.state.get();
        if (state == State.INIT || state == State.GAMEOVER)
            return;
        if (this.model.state.get() == State.PAUSED) {
            this.model.showMessage.set(false);
            this.model.state.set(State.IN_PROGRESS);
            this.tick();
        }
        else {
            this.model.state.set(State.PAUSED);
            if (this.timeoutHandle != undefined)
                clearTimeout(this.timeoutHandle);
            this.model.message.set("Paused");
            this.model.showMessage.set(true);
        }
    }
    endGame() {
        this.model.state.set(State.GAMEOVER);
        if (this.timeoutHandle != undefined)
            clearTimeout(this.timeoutHandle);
        this.model.message.set("Game over");
        this.model.showMessage.set(true);
    }
    updateLines() {
        let lines = 0;
        for (let y = shared_1.gameHeight * BlockModel_1.BlockModel.SIDE_LENGTH; y >= 0; y -= BlockModel_1.BlockModel.SIDE_LENGTH) {
            let line = this.lines[y];
            if (line == undefined)
                break;
            if (line.isComplete()) {
                lines++;
                this.model.lineCount.set(this.model.lineCount.get() + 1);
                this.model.score.set(this.model.score.get() + 250);
                line.clear();
                this.lines[y] = new LineModel();
                for (let yAbove = y - BlockModel_1.BlockModel.SIDE_LENGTH; yAbove >= 0; yAbove -= BlockModel_1.BlockModel.SIDE_LENGTH) {
                    let lineAbove = this.lines[yAbove];
                    if (lineAbove == undefined)
                        break;
                    for (let x in lineAbove.blocks) {
                        let block = lineAbove.blocks[x];
                        let yBelow = yAbove + BlockModel_1.BlockModel.SIDE_LENGTH;
                        let swapLine = lineAbove;
                        if (this.canFall(block) && yBelow < shared_1.gameHeight * BlockModel_1.BlockModel.SIDE_LENGTH) {
                            let lineBelow = this.lines[yBelow];
                            block.y.set(block.y.get() + BlockModel_1.BlockModel.SIDE_LENGTH);
                            lineBelow.blocks[x] = block;
                            delete swapLine.blocks[x];
                        }
                    }
                }
                y += BlockModel_1.BlockModel.SIDE_LENGTH;
            }
        }
        this.model.score.set(this.model.score.get() + ((POINTS_PER_LINE * Math.pow(LEVEL_MULTIPLIER, this.model.level.get() - 1))) * Math.pow(LINE_MULTIPLIER, this.model.level.get() - 1));
    }
    addPiece(piece) {
        this.model.pieceCount.set(this.model.pieceCount.get() + 1);
        this.model.score.set(this.model.score.get() + (POINTS_PER_PIECE * Math.pow(LEVEL_MULTIPLIER, this.model.level.get())));
        this.svg.child(piece.blocks);
    }
    releasePiece(piece) {
        for (let block of piece.blocks) {
            let line = this.lines[block.y.get()];
            if (!line) {
                line = new LineModel();
                this.lines[block.y.get()] = line;
            }
            line.blocks[block.x.get()] = block;
        }
    }
    canFall(block) {
        let lineBelow = this.lines[block.y.get() + BlockModel_1.BlockModel.SIDE_LENGTH];
        if (!lineBelow)
            return true;
        if (lineBelow === this.lastLine)
            return false;
        return lineBelow.blocks[block.x.get()] == undefined;
    }
}
exports.Tetris = Tetris;
const tetris = new Tetris();
window["tetris"] = tetris;

},{"../node_modules/taco-bell/index":1,"./BlockModel":13,"./LPieceModel":14,"./LongPieceModel":15,"./Piece":16,"./PyramidPieceModel":18,"./SPieceModel":19,"./SquarePieceModel":20,"./ZPieceBlockModel":21,"./shared":22}]},{},[23]);
