/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Element, DEBUG, Joint, ENABLE_CROPPING, placingId, Cropper, Deleter, Diode, elementNamesList, LineElement, SpstToggle, EarthGround, ChassisGround, PotentiometrIEEE, PotentiometrIEC, Amplifier, Transformer, PMOS, NMOS, JFETP, JFETN, PNP, NPN, NonRotableLineElement, Resistor, Capacitor, Inductor, DCVoltageSource, diagram, GuiElement, Simulation, ACSimulation, DCSimulation, scale, snapDistance */

function extendDiagramByLoading(diagram) {

    diagram.setAutoCrop = function () {
        if (this.joints.length + this.elements.length > 0) {
            var sx = Number.MAX_VALUE, sy = Number.MAX_VALUE;
            var ex = 0, ey = 0;
            var tmp;
            for (var i = 0; i < this.joints.length; i++) {
                tmp = this.joints[i];
                if (tmp.x - snapDistance < sx) {
                    sx = tmp.x - snapDistance;
                }
                if (tmp.y - snapDistance < sy) {
                    sy = tmp.y - snapDistance;
                }
                if (tmp.x + snapDistance > ex) {
                    ex = tmp.x + snapDistance;
                }
                if (tmp.y + snapDistance > ey) {
                    ey = tmp.y + snapDistance;
                }
            }
            for (var i = 0; i < this.elements.length; i++) {
                tmp = this.elements[i];
                if (tmp.x - tmp.width < sx) {
                    sx = tmp.x - tmp.width;
                }
                if (tmp.y - tmp.width < sy) {
                    sy = tmp.y - tmp.width;
                }
                if (tmp.x + tmp.width > ex) {
                    ex = tmp.x + tmp.width;
                }
                if (tmp.y + tmp.width > ey) {
                    ey = tmp.y + tmp.width;
                }
            }
            this.cropper.startEdit(sx, sy);
            this.cropper.setPos(ex, ey);
        }
    };

    diagram.saveDiagram = function () {
        var sep = ",";
        var ret = "[Diagram]" + sep;
        ret += this.jointId + ":" + this.elementId + sep;
        ret += this.cropper.saveMe() + sep;
        ret += Math.floor(this.xoffset / scale) + ":" + Math.floor(this.yoffset / scale) + sep;
        for (var i = 0; i < this.elements.length; i++) {
            ret += this.elements[i].saveMe() + sep;
        }
        for (var i = 0; i < this.joints.length; i++) {
            ret += this.joints[i].saveMe() + sep;
        }
        for (var i = 0; i < this.netJoints.length; i++) {
            ret += this.netJoints[i].saveMe() + sep;
        }
        for (var i = 0; i < this.simulation.length; i++) {
            ret += this.simulation[i].saveMe();
            if (i !== this.simulation.length - 1) {
                ret += sep;
            }
        }
        return ret;
    };

    diagram.loadSimulationFromText = function (txt) {
        var data = JSON.parse(txt);
        this.loadSimulation(data);
    };

    diagram.loadDiagram = function (txt) {
        var joints = [];
        var netJoints = [];
        var elements = [];
        var simulations = [];
        var jointsInElements = [];
        var uniqueNames = [];

        var tmpJointId, tmpElementId;
        var tmpXOffset, tmpYOffset;
        var cropX, cropY, cropEx, cropEy;
        txt = txt.replace(/(?:\r\n|\r|\n| |\t)/g, '');  //Usuwa białe znaki
        var data = txt.split(",");
        var line;

        try {
            if (data[0] !== "[Diagram]") {
                throw "Not a correct diagram file";
            }
            //READING AND ANALYZING
            line = data[1].split(":");
            tmpJointId = parseInt(line[0]);
            tmpElementId = parseInt(line[1]);
            if (data[2] !== "-") {
                line = data[2].split(":");
                cropX = parseInt(line[0]) * scale;
                cropY = parseInt(line[1]) * scale;
                cropEx = parseInt(line[2]) * scale;
                cropEy = parseInt(line[3]) * scale;
            } else {
                cropX = cropY = cropEx = cropEy = null;
            }
            line = data[3].split(":");
            tmpXOffset = parseInt(line[0]) * scale;
            tmpYOffset = parseInt(line[1]) * scale;
            var tmp, innerLine, border;
            for (var i = 4; i < data.length; i++) {
                line = data[i].split(":");
                switch (line[0]) {
                    case "e":
                        tmp = getElementFromName(line[2], parseInt(line[3]) * scale
                                , parseInt(line[4]) * scale);
                        if (tmp === null) {
                            throw "Wrong element name at line " + i;
                        }
                        tmp.id = parseInt(line[1]);
                        tmp.rotateToDir(parseInt(line[5]));
                        tmp.placed = true;
                        innerLine = line[6].split("|");
                        for (var j = 0; j < innerLine.length; j++) {
                            tmp.joints[j] = parseInt(innerLine[j]);
                        }
                        innerLine = line[7].split("|");
                        if (innerLine[0] !== "") {
                            tmp.netElement.uniqueName = innerLine[0];
                            uniqueNames.push(innerLine[0]);
                        }
                        border = tmp.netElement.netParametersValues.length;
                        for (var j = 0; j < innerLine.length - 1; j++) {
                            if (j < border) {
                                tmp.netElement.netParametersValues[j] = innerLine[j + 1].replace(/(?:_)/g, ' ');
                            } else if (j > border) {
                                tmp.netElement.netParametersVisibility[j - border - 1] = innerLine[j + 1] === "1";
                            } else {
                                tmp.netElement.showName = innerLine[j + 1] === "1";
                            }
                        }
                        tmp.netElement.refreshListText();
                        elements.push(tmp);
                        break;
                    case "s":
                        tmp = getElementFromName(line[2], parseInt(line[3]) * scale
                                , parseInt(line[4]) * scale);
                        if (tmp === null) {
                            throw "Wrong element name at line " + i;
                        }
                        tmp.id = parseInt(line[1]);
                        tmp.placed = true;
                        innerLine = line[5].split("|");
                        if (innerLine[0] !== "") {
                            tmp.netElement.uniqueName = innerLine[0];
                            uniqueNames.push(innerLine[0]);
                        }
                        border = tmp.netElement.netParametersValues.length;
                        for (var j = 0; j < innerLine.length - 1; j++) {
                            if (j < border) {
                                tmp.netElement.netParametersValues[j] = innerLine[j + 1].replace(/(?:_)/g, ' ');
                            } else if (j > border) {
                                tmp.netElement.netParametersVisibility[j - border - 1] = innerLine[j + 1] === "1";
                            } else {
                                tmp.netElement.showName = innerLine[j + 1] === "1";
                            }
                        }
                        tmp.netElement.refreshListText();
                        simulations.push(tmp);
                        break;
                    case "j":
                        tmp = new Joint(parseInt(line[2]) * scale, parseInt(line[3]) * scale);
                        tmp.id = parseInt(line[1]);
                        if (line[5] === "1") {
                            jointsInElements.push(tmp);
                        }
                        innerLine = line[4].split("|");
                        for (var j = 0; j < innerLine.length; j++) {
                            tmp.joints[j] = innerLine[j] !== "-" ? parseInt(innerLine[j]) : null;
                        }
                        joints.push(tmp);
                        break;
                    case "n":
                        tmp = new NetJoint(parseInt(line[1]) * scale, parseInt(line[2]) * scale, null);
                        tmp.uniqueName = line[3];
                        tmp.setUniqueName(line[3]);
                        tmp.joint = line[4] !== "-" ? parseInt(line[4]) : null;
                        netJoints.push(tmp);
                        break;
                    case "":
                        break;
                    default:
                        throw "Unknown element '" + line[0] + "' found in line " + i;
                        break;
                }
            }
            //CONNECTING JOINTS AND ELEMENTS
            for (var i = 0; i < elements.length; i++) {
                tmp = elements[i];
                for (var j = 0; j < tmp.joints.length; j++) {
                    for (var k = 0; k < jointsInElements.length; k++) {
                        if (jointsInElements[k].id === tmp.joints[j]) {
                            tmp.joints[j] = jointsInElements[k];
                            if (parseInt(tmp.joints[j].joints[tmp.attachments[j]]) !== tmp.id) {
                                throw "Element id." + tmp.id + " wants to be attached with joint id." + tmp.joints[j].id + ", but joint refuses!";
                            }
                            tmp.joints[j].joints[tmp.attachments[j]] = tmp;
                            tmp.joints[j].responsible[tmp.attachments[j]] = false;
                            tmp.joints[j].hasElement = true;
                        }
                    }
                }
            }
            for (var i = 0; i < joints.length; i++) {
                tmp = joints[i];
                for (var j = 0; j < 4; j++) {
                    innerLine = tmp.joints[j];
                    if (innerLine !== null) {
                        for (var k = 0; k < joints.length; k++) {
                            if (joints[k].id === innerLine) {
                                tmp.joints[j] = joints[k];
                                if (joints[k].x !== tmp.x && joints[k].y !== tmp.y) {
                                    throw "Joints id." + tmp.id + " and id." + joints[k].id + " cannot be connected!\nTheir coordinates do not match!";
                                }
                                if (tmp.id > joints[k].id) {
                                    tmp.responsible[j] = true;
                                }
                                break;
                            }
                        }
                    }
                }
            }
            for (var i = 0; i < netJoints.length; i++) {
                tmp = netJoints[i];
                if (tmp.joint !== null) {
                    for (var j = 0; j < joints.length; j++) {
                        if (tmp.joint === joints[j].id) {
                            joints[j].addNetJoint(tmp);
                            tmp.joint = joints[j];
                            break;
                        }
                    }
                }
            }
            //TESTING
            for (var i = 0; i < elements.length; i++) {
                tmp = elements[i];
                for (var j = 0; j < tmp.joints.length; j++) {
                    if (!(tmp.joints[j] instanceof Joint)) {
                        throw "Unknown element attached to element '" + tmp.name + "' id." + tmp.id + ":\n" + tmp.joints[j];
                    }
                }
            }
            for (var i = 0; i < jointsInElements.length; i++) {
                if (!jointsInElements[i].hasElement) {
                    throw "Joint id." + jointsInElements[i].id + " should be attached to an element, but it is not";
                }
            }
            for (var i = 0; i < joints.length; i++) {
                tmp = joints[i];
                for (var j = 0; j < 4; j++) {
                    if (tmp.joints[j] !== null && !(tmp.joints[j] instanceof Element) && !(tmp.joints[j] instanceof Joint)) {
                        throw "Unknown element attached to joint id." + tmp.id + ":\n" + tmp.joints[j];
                    }
                }
            }
            for (var i = 0; i < netJoints.length; i++) {
                tmp = netJoints[i];
                if (tmp.joint !== null && !(tmp.joint instanceof Joint)) {
                    throw "Unknown element attached to Joint Name (" + tmp.x + ", " + tmp.y + ") : id." + tmp.joint;
                }
            }
            //APPLY TO THE DIAGRAM
            this.elements = [];
            this.GUI = [this.GUI[0], this.GUI[1], this.GUI[2]];
            this.simulation = [];
            this.joints = [];
            this.netJoints = [];
            nameTable = uniqueNames;
            this.jointId = tmpJointId;
            this.elementId = tmpElementId;
            this.cropper.x = cropX;
            this.cropper.y = cropY;
            this.cropper.ex = cropEx;
            this.cropper.ey = cropEy;
            this.xoffset = tmpXOffset;
            this.yoffset = tmpYOffset;
            for (var i = 0; i < elements.length; i++) {
                this.elements.push(elements[i]);
                elements[i].netElement.addList();
            }
            for (var i = 0; i < joints.length; i++) {
                this.joints.push(joints[i]);
            }
            for (var i = 0; i < netJoints.length; i++) {
                this.netJoints.push(netJoints[i]);
                this.addElement(netJoints[i].listGUI);
            }
            for (var i = 0; i < simulations.length; i++) {
                this.simulation.push(simulations[i]);
                simulations[i].netElement.addList();
            }
            console.log("File loaded");
        } catch (err) {
            console.log(err);
            alert("Error while loading the file:\n" + err);
        }
    };

    diagram.test = function () {
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].clearSpreadData();
        }
        for (var i = 0; i < this.netJoints.length; i++) {
            this.netJoints[i].setUpNetNodes();
        }
    };

    diagram.getDiagramNetlist = function () {
        var grounds = [];
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].isGround) {
                grounds.push(this.elements[i]);
            }
            this.elements[i].getNetElement().clearData();
        }
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].clearSpreadData();
        }
        clearNetNodesIds();
        for (var i = 0; i < this.elements.length; i++) {
            if (!this.elements[i].isGround) {
                this.elements[i].setUpNetNodes();
            }
        }
        if (grounds.length > 0 || this.netJoints.length > 0) {
            for (var i = 0; i < this.joints.length; i++) {
                this.joints[i].clearSpreadData();
            }
            for (var i = 0; i < grounds.length; i++) {
                grounds[i].setUpNetNodes();
            }
            for (var i = 0; i < this.netJoints.length; i++) {
                this.netJoints[i].setUpNetNodes();
            }
        }
        var text = "";
        for (var i = 0; i < this.elements.length; i++) {
            if (!this.elements[i].isGround) {
                text += this.elements[i].getNetElement().getNetElementString() + "\n";
            }
        }
        var ret = {simulations: []};
        for (var i = 0; i < this.simulation.length; i++) {
            ret[this.simulation[i].id] = text + this.simulation[i].getNetElement().getNetElementString() + "\n";
            ret["simulations"].push(this.simulation[i]);
        }
        return ret;
    };
}
