/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Element, DEBUG, Joint, ENABLE_CROPPING, placingId, Cropper, Deleter, Diode, elementNamesList, LineElement, SpstToggle, EarthGround, ChassisGround, PotentiometrIEEE, PotentiometrIEC, Amplifier, Transformer, PMOS, NMOS, JFETP, JFETN, PNP, NPN, NonRotableLineElement, Resistor, Capacitor, Inductor, DCVoltageSource, diagram, GuiElement, Simulation, ACSimulation, DCSimulation, ACVoltageSource, NetJoint */

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

var nameTable = [];
function existsInNameTable(name) {
    for (var i = 0; i < nameTable.length; i++) {
        if (nameTable[i] === name) {
            return true;
        }
    }
    return false;
}

function addToNameTable(name) {
    nameTable.push(name);
}

function removeFromNameTable(name) {
    for (var i = 0; i < nameTable.length; i++) {
        if (nameTable[i] === name) {
            nameTable.splice(i, 1);
        }
    }
}

function Diagram(width, height) {
    this.windowWidth = width;
    this.windowHeight = height;
    scale = Math.floor(Math.min(width, height) / 120) * 1.1;
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
    this.netJoints = [];

    this.nameToJoint = {};

    this.simulationGUI = new SimulationGUI(this.windowWidth, this.windowHeight);

    this.GUI = [new ToolsAppearer(this.windowWidth, this.windowHeight),
        new FileAppearer(this.windowHeight),
        this.simulationGUI
    ];

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
        for (var i = 0; i < this.netJoints.length; i++) {
            if (this.netJoints[i].deleteMe(x, y)) {
                deleted = true;
                break;
            }
        }
        if (!deleted) {
            for (var i = 0; i < this.joints.length; i++) {
                if (this.joints[i].deleteMe(x, y)) {
                    deleted = true;
                    break;
                }
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
            for (var i = 0; i < this.simulation.length; i++) {
                if (this.simulation[i].deleteMe(x, y)) {
                    deleted = true;
                    break;
                }
            }
        }
        if (!deleted) {
            this.edited = this.deleter;
            this.deleter.startEdit(x, y);
        }
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].refreshNetJoint();
        }
    };

    this.checkGUIInPlace = function (x, y) {
        for (var i = this.GUI.length - 1; i >= 0; i--) {
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
        var toDelete = [];
        for (var i = 0; i < this.netJoints.length; i++) {
            if (!checked && this.netJoints[i].isClose(x, y)) {
                if (!this.netJoints[i].isListOpen()) {
                    this.netJoints[i].showList(x, y);
                    checked = true;
                }
            } else {
                this.netJoints[i].hideList();
                if (this.netJoints[i].uniqueName === "") {
                    toDelete.push(this.netJoints[i]);
                }
            }
        }
        for (var i = 0; i < toDelete.length; i++) {
            this.deleteElement(toDelete[i]);
        }
        var point;
        if (!checked) {
            for (var i = 0; i < this.joints.length; i++) {
                point = this.joints[i].getClosestPoint(x, y);
                if (point !== null) {
                    var net = new NetJoint(point.x, point.y, this.joints[i]);
                    this.joints[i].addNetJoint(net);
                    if (this.joints[i].netJoint !== null) {
                        this.addElement(net);
                        this.addElement(net.listGUI);
                        checked = true;
                        net.showList(x, y);
                        break;
                    }
                }
            }
        }
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

    this.showReport = function () {
        var ret = "JOINTS:\n\n";
        for (var i = 0; i < this.joints.length; i++) {
            ret += " " + this.joints[i].saveMe() + "\n";
        }
        ret += "\n\nELEMENTS:\n\n";
        for (var i = 0; i < this.elements.length; i++) {
            ret += " " + this.elements[i].saveMe() + "\n";
        }
        ret += "\n\nSIMULATIONS:\n\n";
        for (var i = 0; i < this.simulation.length; i++) {
            ret += " " + this.simulation[i].saveMe() + "\n";
        }
        return ret;
    };

    this.getSimulationErrors = function () {
        var ret = [];
        if (this.elements.length === 0 || this.joints.length === 0) {
            ret.push("There are no elements");
        }
        if (this.simulation.length === 0) {
            ret.push("There are no simulation elements");
        }
        for (var i = 0; i < this.elements.length; i++) {
            if (!this.elements[i].isGround && this.elements[i].netElement.netName === "ERROR") {
                ret.push("Element '" + this.elements[i].name + "' cannot be simulated");
            }
        }
        return ret;
    };

    this.loadSimulation = function (data) {
        if ("simulations" in data) {
            var sim;
            var show = false;
            for (var i = 0; i < data["simulations"].length; i++) {
                sim = data["simulations"][i];
                switch (sim.netElement.netName) {
                    case ".AC":
                        this.simulationGUI.setData(data, sim);
                        show = true;
                        break;
                    case ".DC":
                        var depKeys = [];
                        var refKeys = data[sim.id]["variables"];
                        for (var k in refKeys) {
                            depKeys.push(k);
                        }
                        var name, unit;
                        for (var i = 0; i < depKeys.length; i++) {
                            name = depKeys[i].slice(0, -2);
                            unit = depKeys[i].slice(-1);
                            switch (unit) {
                                case "I":
                                    unit = "A";
                                    break;
                                case "V":
                                    unit = "V";
                                    break;
                                default:
                                    unit = "";
                                    break;
                            }
                            for (var j = 0; j < this.joints.length; j++) {
                                if (this.joints[j].nodeId === name) {
                                    this.joints[j].simulationValue = Math.abs(data[sim.id][depKeys[i]][0].toFixed(2)) + " " + unit;
                                }
                            }
                        }
                        DC_SIMULATION = true;
                        break;
                }
            }
            if (show) {
                this.simulationGUI.visible = true;
                this.simulationGUI.alwaysVisible = true;
            }
        } else if ("variables" in data) {
            this.simulationGUI.setDataSingle(data);
            this.simulationGUI.visible = true;
            this.simulationGUI.alwaysVisible = true;
        } else {
            throw new Error("To nie jest Datalist");
        }
    };

    this.unloadSimulation = function () {
        this.simulationGUI.visible = false;
        this.simulationGUI.alwaysVisible = false;
        this.simulationGUI.closeMe();
    };

    this.getSimulationData = function () {
        return this.simulationGUI.getData();
    };

    this.addElement = function (element) {
        if (element instanceof Joint) {
            this.joints.push(element);
            element.id = this.jointId++;
        } else if (element instanceof GuiElement) {
            this.GUI.push(element);
        } else if (element instanceof Simulation) {
            this.simulation.push(element);
            var newIndex = false;
            while (!newIndex) {
                newIndex = true;
                for (var i = 0; i < this.simulation.length; i++) {
                    if (this.simulation[i].id === this.simulationId) {
                        this.simulationId++;
                        newIndex = false;
                        break;
                    } else if (this.simulation[i].id > this.simulationId) {
                        this.simulationId = this.simulation[i].id + 1;
                        newIndex = false;
                        break;
                    }
                }
            }
            element.id = this.simulationId++;
            element.netElement.addList();
        } else if (element instanceof NetJoint) {
            this.netJoints.push(element);
        } else {
            this.elements.push(element);
            element.netElement.addList();
            element.id = this.elementId++;
            for (var i = 0; i < element.joints.length; i++) {
                this.addElement(element.joints[i]);
            }
            /*if (DEBUG) {
             var joint;
             for (var i = 0; i < element.joints.length; i++) {
             joint = element.joints[i];
             console.log(i + "." + joint);
             for (var j = 0; j < 4; j++) {
             console.log(" " + j + ". " + (joint.joints[j] === null));
             }
             }
             }*/
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
                        removeFromNameTable(element.netElement.uniqueName);
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
                        removeFromNameTable(element.netElement.uniqueName);
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
        } else if (element instanceof NetJoint) {
            for (var i = 0; i < this.netJoints.length; i++) {
                if (this.netJoints[i] === element) {
                    removeFromNameTable(element.uniqueName);
                    this.netJoints.splice(i, 1);
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
                    if (i !== dir) {
                        joint = this.edited.joints[i];
                        if (joint !== null && (joint.x !== previous.x || joint.y !== previous.y)) {
                            joint = this.findExactJoint(joint.x, joint.y, false, joint);
                            if (joint.id !== null) {
                                additional.push(i);
                                additional.push(joint);
                                //console.log(i + " " + joint.id + " " + joint.x + " " + joint.y);
                            }
                        }
                    }
                }
                //this.edited.deleteMe(this.edited.x, this.edited.y);
                //this.edited.setPos(this.edited.x, this.edited.y - 40);
                this.edited.place(dir, previous);
                //console.log(" " + dir + " " + previous.id + " " + previous.x + " " + previous.y);
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
        this.simulationId = 0;
        this.netJoints = [];
        nameTable = [];
        this.GUI = [this.GUI[0], this.GUI[1], this.GUI[2]];
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
        "diode", Diode,
        "resistorIEEE", Resistor,
        "resistorIEC", Resistor,
        "capacitor", Capacitor,
        "inductor", Inductor,
        "cell", DCVoltageSource,
        "voltmeter", NonRotableLineElement,
        "ammeter", NonRotableLineElement,
        "ohmmeter", NonRotableLineElement,
        "wattmeter", NonRotableLineElement,
        "ACVolSource", ACVoltageSource,
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
