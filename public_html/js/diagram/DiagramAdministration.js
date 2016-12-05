/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Element, DEBUG, Joint, ENABLE_CROPPING, placingId, Cropper, Deleter, Diode, elementNamesList, LineElement, SpstToggle, EarthGround, ChassisGround, PotentiometrIEEE, PotentiometrIEC, Amplifier, Transformer, PMOS, NMOS, JFETP, JFETN, PNP, NPN, NonRotableLineElement, Resistor, Capacitor, Inductor, DCVoltageSource, diagram, GuiElement, Simulation, ACSimulation, DCSimulation */

var JOINT_ELEMENT = 0, NORMAL_ELEMENT = 1, CROP_ELEMENT = 2;

var mode = 0;

var MODE_NORMAL = 0, MODE_JOINTS = 1, MODE_DELETE = 2, MODE_MOVE = 3;

var nullElement = {
    id: null
};

var placingElement = null;

var snapDistance; //Odległość po której obiekt jest wychwytywany (scale * 2)

var scale, orgScale; //Jednostka skali (wielkości) planszy
var halfScale; //Jednostka skali (wielkości) planszy
var lineWidth; //scale / 4

function distance(sx, sy, ex, ey) {
    return Math.max(Math.abs(sx - ex), Math.abs(sy - ey));
}

function Diagram(width, height) {
    this.windowWidth = width;
    this.windowHeight = height;
    scale = Math.floor(Math.min(width, height) / 120);
    halfScale = scale / 2;
    snapDistance = scale * 2;
    lineWidth = scale / 4;
    this.edited = nullElement;
    this.selected = nullElement;

    this.xoffset = 0;
    this.yoffset = 0;

    this.elementId = 0;
    this.jointId = 0;
    this.simulationId = 0;

    this.joints = [];
    this.elements = [];
    this.simulation = [];
    this.GUI = [new ToolsAppearer(this.windowWidth, this.windowHeight),
        new FileAppearer(this.windowHeight)/*,
         new ChangableText(100, 100, 80, "20 Ohm"),
         new ChangableText(100, 150, 80, "10 Ohm")*/];

    this.placer = new LinePlacer();
    this.cropper = new Cropper();
    this.deleter = new Deleter();
    
    extendDiagramByDrawing(this);
    extendDiagramByLoading(this);
    
    this.changeScale = function (change) {
        scale = orgScale * change;
        halfScale = scale / 2;
        snapDistance = scale * 2;
        lineWidth = scale / 4;
    };

    this.addElementInPlace = function (code, x, y) {
        var element = null;
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            x -= this.xoffset;
            y -= this.yoffset;
        }
        switch (code) {
            case JOINT_ELEMENT:
                var joint = this.findClosestJoint(x, y, false, this.edited);
                if (joint.id !== null) {
                    this.edited = joint;
                    this.placer.setEdited(joint);
                }
                break;
            case NORMAL_ELEMENT:
                if (placingElement !== null) {
                    element = placingElement.getElement(x, y);
                }
                break;
            case CROP_ELEMENT:
                x = Math.floor(x / scale) * scale;
                y = Math.floor(y / scale) * scale;
                this.cropper.startEdit(x, y);
                this.edited = this.cropper;
                break;
        }
        if (element !== null) {
            this.edited = element;
            this.addElementEdited(element);
        }
    };

    this.addJointInPlace = function (x, y) {
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            x -= this.xoffset;
            y -= this.yoffset;
        }
        var joint = this.findClosestJoint(x, y, false, this.edited);
        if (joint.id === null) {
            joint = new Joint(Math.floor(x / scale) * scale
                    , Math.floor(y / scale) * scale);
            this.addElement(joint);
        }
        this.edited = joint;
        this.placer.setEdited(joint);
    };

    this.deleteElementInPlace = function (x, y) {
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            x -= this.xoffset;
            y -= this.yoffset;
        }
        var deleted = false;
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i].deleteMe(x, y)) {
                deleted = true;
                break;
            }
        }
        if (!deleted) {
            for (var i = 0; i < this.elements.length; i++) {
                if (this.elements[i].deleteMe(x, y)) {
                    deleted = true;
                    break;
                }
            }
        }
        if (!deleted) {
            this.edited = this.deleter;
            this.deleter.startEdit(x, y);
        }
    };

    this.checkGUIInPlace = function (x, y) {
        for (var i = 0; i < this.GUI.length; i++) {
            if (this.GUI[i].onClick(x, y)) {
                return true;
            }
        }
        return false;
    };

    this.checkVariableListsInPlace = function (x, y) {
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            x -= this.xoffset;
            y -= this.yoffset;
        }
        var checked = false;
        for (var i = 0; i < this.elements.length; i++) {
            if (!checked && this.elements[i].isClose(x, y)) {
                if (!this.elements[i].netElement.isListOpen()) {
                    this.elements[i].showList(x, y);
                    checked = true;
                }
            } else {
                this.elements[i].hideList();
            }
        }
        for (var i = 0; i < this.simulation.length; i++) {
            if (!checked && this.simulation[i].isClose(x, y)) {
                if (!this.simulation[i].netElement.isListOpen()) {
                    this.simulation[i].showList(x, y);
                    checked = true;
                }
            } else {
                this.simulation[i].hideList();
            }
        }
        return checked;
    };

    this.rotateElement = function (x, y) {
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            x -= this.xoffset;
            y -= this.yoffset;
        }
        if (this.edited.id !== null && this.edited instanceof Element) {
            this.edited.rotate();
        } else {
            x = Math.floor(x / scale) * scale;
            y = Math.floor(y / scale) * scale;
            for (var i = 0; i < this.elements.length; i++) {
                if (this.elements[i].id !== this.edited.id) {
                    if (this.elements[i].isClose(x, y)) {
                        this.elements[i].rotate();
                    }
                }
            }
        }
    };

    this.addElement = function (element) {
        if (element instanceof Joint) {
            this.joints.push(element);
            element.id = this.jointId++;
        } else if (element instanceof GuiElement) {
            this.GUI.push(element);
        } else if (element instanceof Simulation) {
            this.simulation.push(element);
            element.id = this.simulationId++;
            element.netElement.addList();
        } else {
            this.elements.push(element);
            element.netElement.addList();
            element.id = this.elementId++;
            for (var i = 0; i < element.joints.length; i++) {
                this.addElement(element.joints[i]);
            }
            if (DEBUG) {
                var joint;
                for (var i = 0; i < element.joints.length; i++) {
                    joint = element.joints[i];
                    console.log(i + "." + joint);
                    for (var j = 0; j < 4; j++) {
                        console.log(" " + j + ". " + (joint.joints[j] === null));
                    }
                }
            }
        }
    };

    this.deleteElement = function (element) {
        if (element.id !== null) {
            if (element instanceof Joint) {
                for (var i = 0; i < this.joints.length; i++) {
                    if (this.joints[i] === element) {
                        this.joints.splice(i, 1);
                        var j;
                        for (j = 0; j < this.joints.length; j++)
                            this.joints[j].id = j;
                        this.jointId = j;
                        break;
                    }
                }
            } else if (element instanceof Element) {
                for (var i = 0; i < this.elements.length; i++) {
                    if (this.elements[i] === element) {
                        this.elements.splice(i, 1);
                        var j;
                        for (j = 0; j < this.elements.length; j++)
                            this.elements[j].id = j;
                        this.elementId = j;
                        break;
                    }
                }
            } else if (element instanceof Simulation) {
                for (var i = 0; i < this.simulation.length; i++) {
                    if (this.simulation[i] === element) {
                        this.simulation.splice(i, 1);
                        break;
                    }
                }
            }
        }
        if (element instanceof GuiElement) {
            for (var i = 0; i < this.GUI.length; i++) {
                if (this.GUI[i] === element) {
                    this.GUI.splice(i, 1);
                    break;
                }
            }
        }
    };

    this.addElementEdited = function (element) {
        this.edited = element;
        this.selected = nullElement;
        this.addElement(element);
    };

    this.moveEdited = function (x, y) {
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            x -= this.xoffset;
            y -= this.yoffset;
        }
        x = Math.floor(x / scale) * scale;
        y = Math.floor(y / scale) * scale;
        if (this.edited.id !== null) {
            if (this.edited instanceof Joint) {
                this.placer.edit(x, y);
            } else {
                this.edited.setPos(x, y);
            }
        }
    };

    this.discardEdited = function () {
        if (this.edited instanceof Joint) {
            if (this.placer.isPlaceable()) {
                var joint = this.findClosestJoint(this.placer.x, this.placer.y, false, this.edited);
                if (joint.id !== null) {
                    this.placer.connect(joint);
                } else {
                    this.placer.place();
                }
                this.placer.clear();
            } else {
                this.edited.simplify();
            }
        } else if (this.edited instanceof Element/* && this.edited.isPlaceable()*/) {
            var joint, dir;
            for (var i = 0; i < this.edited.joints.length; i++) {
                joint = this.edited.joints[i];
                joint = this.findClosestJoint(joint.x, joint.y, false, joint);
                if (joint.id !== null) {
                    dir = i;
                    this.edited.changePlaceTo(i, joint);
                    //this.edited.place(i, joint, false);//
                    break;
                }
            }
            var additional = [];
            var previous = joint;
            if (previous.id !== null) {
                for (var i = 0; i < this.edited.joints.length; i++) {
                    joint = this.edited.joints[i];
                    if (joint !== null && (joint.x !== previous.x || joint.y !== previous.y)) {
                        joint = this.findExactJoint(joint.x, joint.y, false, joint);
                        if (joint.id !== null) {
                            additional.push(i);
                            additional.push(joint);
                        }
                    }
                }
                this.edited.place(dir, previous);
                for (var i = 0; i < additional.length; i += 2) {
                    this.edited.place(additional[i], additional[i + 1]);
                }
            }
            this.edited.placed = true;
        } else if (this.edited instanceof Deleter && this.edited.isUsable()) {
            var tmp;
            var toDelete = [];
            for (var i = 0; i < this.elements.length; i++) {
                tmp = this.elements[i];
                if (tmp.x > this.edited.getXStart() && tmp.x < this.edited.getXEnd()
                        && tmp.y > this.edited.getYStart() && tmp.y < this.edited.getYEnd()) {
                    toDelete.push(tmp);
                }
            }
            for (var i = 0; i < this.joints.length; i++) {
                tmp = this.joints[i];
                if (tmp.x > this.edited.getXStart() && tmp.x < this.edited.getXEnd()
                        && tmp.y > this.edited.getYStart() && tmp.y < this.edited.getYEnd()) {
                    toDelete.push(tmp);
                } else {
                    tmp.cutLines(this.edited.getXStart(), this.edited.getYStart()
                            , this.edited.getXEnd(), this.edited.getYEnd());
                }
            }
            for (var i = 0; i < toDelete.length; i++) {
                tmp = toDelete[i];
                tmp.deleteMe(tmp.x, tmp.y);
            }
        } else if (this.edited instanceof Simulation) {
            this.edited.placed = true;
        }
        this.selected = this.edited;
        this.edited = nullElement;
    };

    this.moveDiagram = function (x, y) {
        this.xoffset = Math.floor(x / scale) * scale;
        this.yoffset = Math.floor(y / scale) * scale;
    };

    this.clearDiagram = function () {
        this.edited = nullElement;
        this.selected = nullElement;
        this.xoffset = 0;
        this.yoffset = 0;
        this.elementId = 0;
        this.jointId = 0;
        this.joints = [];
        this.elements = [];
        this.simulation = [];
        this.GUI = [this.GUI[0], this.GUI[1]];
        this.cropper.startEdit(null, null);
    };

    this.findClosestJoint = function (mx, my, onlyJoints, exception) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i].id !== exception.id) {
                var joint = this.joints[i].getClosestJoint(mx, my, onlyJoints);
                if (joint !== null)
                    return joint;
            }
        }
        return nullElement;
    };

    this.findExactJoint = function (mx, my, onlyJoints, exception) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i].id !== exception.id) {
                var joint = this.joints[i].getExactJoint(mx, my, onlyJoints);
                if (joint !== null) {
                    return joint;
                }
            }
        }
        return nullElement;
    };

    //Kontruktory elementów ktore nie sa proste (jak dioda)

    elementConstructorTable = [
        "acSimulation", ACSimulation,
        "dcSimulation", DCSimulation,
        "resistorIEEE", Resistor,
        "resistorIEC", Resistor,
        "capacitor", Capacitor,
        "inductor", Inductor,
        "cell", DCVoltageSource,
        "voltmeter", NonRotableLineElement,
        "ammeter", NonRotableLineElement,
        "ohmmeter", NonRotableLineElement,
        "wattmeter", NonRotableLineElement,
        "ACVolSource", NonRotableLineElement,
        "motor", NonRotableLineElement,
        "spstToggle", SpstToggle,
        "earthGround", EarthGround,
        "chassisGround", ChassisGround,
        "potentiometrIEEE", PotentiometrIEEE,
        "potentiometrIEC", PotentiometrIEC,
        "npn", NPN,
        "pnp", PNP,
        "jfetn", JFETN,
        "jfetp", JFETP,
        "nmos", NMOS,
        "pmos", PMOS,
        "transformer", Transformer,
        "amplifier", Amplifier
    ];
}

function getElementFromName(name, x, y) {
    for (var i = 0; i < elementConstructorTable.length; i += 2) {
        if (elementConstructorTable[i] === name) {
            return new elementConstructorTable[i + 1](x, y, name);
        }
    }
    return new LineElement(x, y, name);
}

function getNetlist() {
    return diagram.getDiagramNetlist();
}
