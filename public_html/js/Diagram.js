/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Element, DEBUG, Joint, ENABLE_CROPPING, placingId, Cropper, Deleter, Diode, elementNamesList */

var JOINT_ELEMENT = 0, NORMAL_ELEMENT = 1, CROP_ELEMENT = 2;

var mode = 0;

var MODE_NORMAL = 0, MODE_JOINTS = 1, MODE_DELETE = 2, MODE_MOVE = 3;

var nullElement = {
    id: -1
};

var placingElement = null;

var snapDistance; //Odległość po której obiekt jest wychwytywany (scale * 2)

var scale; //Jednostka skali (wielkości) planszy

function distance(sx, sy, ex, ey) {
    return Math.max(Math.abs(sx - ex), Math.abs(sy - ey));
}

function Diagram(width, height) {
    this.windowWidth = width;
    this.windowHeight = height;
    scale = Math.floor(Math.min(width, height) / 120);
    snapDistance = scale * 2;
    this.edited = nullElement;
    this.selected = nullElement;

    this.xoffset = 0;
    this.yoffset = 0;

    this.elementId = 0;
    this.jointId = 0;

    this.joints = [];
    this.elements = [];
    this.GUI = [new ToolsAppearer(this.windowWidth, this.windowHeight), new FileAppearer(this.windowHeight)];

    this.placer = new LinePlacer();
    this.cropper = new Cropper();
    this.deleter = new Deleter();

    this.addElementInPlace = function (code, x, y) {
        var element = null;
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            x -= this.xoffset;
            y -= this.yoffset;
        }
        switch (code) {
            case JOINT_ELEMENT:
                var joint = this.findClosestJoint(x, y, false, this.edited);
                if (joint.id !== -1) {
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
        if (joint.id === -1) {
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

    this.rotateElement = function (x, y) {
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            x -= this.xoffset;
            y -= this.yoffset;
        }
        if (this.edited.id !== -1 && this.edited instanceof Element) {
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
        } else {
            this.elements.push(element);
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
        if (element.id !== -1) {
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
        if (this.edited.id !== -1) {
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
                if (joint.id !== -1) {
                    this.placer.connect(joint);
                } else {
                    this.placer.place();
                }
                this.placer.clear();
            } else {
                this.edited.simplify();
            }
        } else if (this.edited instanceof Element && this.edited.isPlaceable()) {
            var joint;
            for (var i = 0; i < this.edited.joints.length; i++) {
                joint = this.edited.joints[i];
                joint = this.findClosestJoint(joint.x, joint.y, false, joint);
                if (joint.id !== -1) {
                    this.edited.place(i, joint, false);
                    break;
                }
            }
            var previous = joint;
            if (previous.id !== -1) {
                for (var i = 0; i < this.edited.joints.length; i++) {
                    joint = this.edited.joints[i];
                    if (joint.id !== previous.id) {
                        joint = this.findExactJoint(joint.x, joint.y, false, joint);
                        if (joint.id !== -1) {
                            this.edited.place(i, joint, true);
                            break;
                        }
                    }
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
        }
        this.selected = this.edited;
        this.edited = nullElement;
    };

    this.moveDiagram = function (x, y) {
        this.xoffset = Math.min(Math.floor(x / scale) * scale, 0);
        this.yoffset = Math.min(Math.floor(y / scale) * scale, 0);
    };

    this.setAutoCrop = function () {
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

    this.clearDiagram = function () {
        this.edited = nullElement;
        this.selected = nullElement;
        this.xoffset = 0;
        this.yoffset = 0;
        this.elementId = 0;
        this.jointId = 0;
        this.joints = [];
        this.elements = [];
        this.cropper.startEdit(-1, -1);
    };

    this.saveDiagram = function () {
        var sep = ",";
        var ret = "[Diagram]" + sep;
        ret += this.jointId + ":" + this.elementId + sep;
        ret += this.cropper.saveMe() + sep;
        for (var i = 0; i < this.elements.length; i++) {
            ret += this.elements[i].saveMe() + sep;
        }
        for (var i = 0; i < this.joints.length; i++) {
            ret += this.joints[i].saveMe();
            if (i !== this.joints.length - 1) {
                ret += sep;
            }
        }
        return ret;
    };

    this.loadDiagram = function (txt) {
        var joints = [];
        var elements = [];
        var jointsInElements = [];

        var tmpJointId, tmpElementId;
        var cropX, cropY, cropEx, cropEy;
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
                cropX = cropY = cropEx = cropEy = -1;
            }
            var tmp, innerLine;
            for (var i = 3; i < data.length; i++) {
                line = data[i].split(":");
                switch (line[0]) {
                    case "e":
                        tmp = getElementFromName(line[2], parseInt(line[3]) * scale
                                , parseInt(line[4]) * scale);
                        if (tmp === null) {
                            throw "Wrong element name at line " + i;
                        }
                        tmp.id = parseInt(line[1]);
                        tmp.direction = parseInt(line[5]);
                        tmp.placed = true;
                        innerLine = line[6].split("|");
                        for (var j = 0; j < innerLine.length; j++) {
                            tmp.joints[j] = parseInt(innerLine[j]);
                        }
                        elements.push(tmp);
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
                                if (tmp.id > joints[k].id) {
                                    tmp.responsible[j] = true;
                                }
                                break;
                            }
                        }
                    }
                }
            }
            //TESTING
            for (var i = 0; i < elements.length; i++) {
                tmp = elements[i];
                for (var j = 0; j < tmp.joints.length; j++) {
                    if (!(tmp.joints[j] instanceof Joint)) {
                        throw "Wrong data of element '" + tmp.name + "' id." + tmp.id;
                    }
                }
            }
            for (var i = 0; i < jointsInElements.length; i++) {
                if (!jointsInElements[i].hasElement) {
                    throw "Wrong data of joint id." + jointsInElements[i].id;
                }
            }
            for (var i = 0; i < joints.length; i++) {
                tmp = joints[i];
                for (var j = 0; j < 4; j++) {
                    if (!tmp.joints[j] instanceof Joint) {
                        throw "Wrong data of joint id." + tmp.id;
                    }
                }
            }
            //APLLY TO THE DIAGRAM
            this.elements = [];
            this.joints = [];
            this.jointId = tmpJointId;
            this.elementId = tmpElementId;
            this.cropper.x = cropX;
            this.cropper.y = cropY;
            this.cropper.ex = cropEx;
            this.cropper.ey = cropEy;
            for (var i = 0; i < elements.length; i++) {
                this.elements.push(elements[i]);
            }
            for (var i = 0; i < joints.length; i++) {
                this.joints.push(joints[i]);
            }
            console.log("File loaded");
        } catch (err) {
            console.log(err);
            alert("Error while loading the file:\n" + err);
        }
    };

    this.clearScreen = function (l, lc) {
        lc.beginPath();
        lc.clearRect(0, 0, l.width, l.height);
    };

    this.drawBackground = function (bgl, bgc) {
        bgc.save();
        this.clearScreen(bgl, bgc);
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            bgc.translate(this.xoffset, this.yoffset);
        }
        this.drawOnlyBackground(bgl, bgc);
        this.cropper.drawMe(bgl, bgc);
        bgc.restore();
        this.GUI[0].drawOnlyMe(bgl, bgc);
        this.GUI[1].drawOnlyMe(bgl, bgc);
    };

    this.drawBackgroundForImage = function (bgl, bgc, background) {
        if (ENABLE_CROPPING && this.cropper.isUsable()) {
            bgl.width = this.cropper.getWidth();
            bgl.height = this.cropper.getHeight();
        }
        bgc.save();
        if (background) {
            bgc.beginPath();
            bgc.rect(0, 0, bgl.width, bgl.height);
            bgc.fillStyle = 'white';
            bgc.fill();
        } else {
            this.clearScreen(bgl, bgc);
        }
        if (ENABLE_CROPPING && this.cropper.isUsable()) {
            bgc.translate(-this.cropper.getXStart(), -this.cropper.getYStart());
        }
        this.drawOnlyBackground(bgl, bgc);
        bgc.restore();
    };

    this.drawOnlyBackground = function (bgl, bgc) {
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].drawMe(bgl, bgc);
        }
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].placed) {
                this.elements[i].drawMe(bgl, bgc);
            }
        }
    };

    this.drawWorkingLayer = function (dl, dc, mx, my) {
        dc.save();
        this.clearScreen(dl, dc);
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            dc.translate(this.xoffset, this.yoffset);
            mx -= this.xoffset;
            my -= this.yoffset;
        }
        if (this.edited.id !== -1) {
            if (this.edited instanceof Joint) {
                this.placer.drawMe(dl, dc);
                this.highlightJoints(dl, dc, this.placer.x, this.placer.y, this.edited);
            } else if (this.edited instanceof Element) {
                this.edited.drawMe(dl, dc);
                var joint;
                for (var i = 0; i < this.edited.joints.length; i++) {
                    joint = this.edited.joints[i];
                    if (this.highlightJoints(dl, dc, joint.x, joint.y, joint)) {
                        break;
                    }
                }
            } else {
                this.edited.drawMe(dl, dc);
                if (!this.edited instanceof Cropper && !this.edited instanceof Deleter) {
                    this.highlightJoints(dl, dc, this.edited.x, this.edited.y, this.edited);
                }
            }
        } else {
            if (!this.highlightJoints(dl, dc, mx, my, this.edited)) {
                if (!this.highlightElements(dl, dc, mx, my, this.edited)
                        && mode === MODE_JOINTS) {
                    this.drawJoint(dl, dc, mx, my);
                }
            }
        }
        dc.restore();
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            mx += this.xoffset;
            my += this.yoffset;
        }
        for (var i = 0; i < this.GUI.length; i++) {
            if (this.edited.id === -1) {
                this.GUI[i].onMouseOver(mx, my);
            }
            this.GUI[i].drawMe(dl, dc);
        }
        this.drawCursor(dl, dc, mx, my);
    };

    this.drawJoint = function (dl, dc, mx, my) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        dc.beginPath();
        dc.arc(mx, my, snapDistance, 0, 2 * Math.PI);
        dc.strokeStyle = 'blue';
        dc.lineWidth = scale / 4;
        dc.stroke();

        dc.beginPath();
        dc.arc(mx, my, scale / 2, 0, 2 * Math.PI);
        dc.fillStyle = 'black';
        dc.fill();
    };

    this.drawCursor = function (dl, dc, mx, my) {
        if (placingId === CROP_ELEMENT || mode === MODE_MOVE) {
            mx = Math.floor(mx / scale) * scale;
            my = Math.floor(my / scale) * scale;
            dc.beginPath();
            dc.arc(mx, my, scale / 2, 0, 2 * Math.PI);
            dc.fillStyle = mode !== MODE_MOVE ? '#7DDEFF' : '#0F2CFF';
            dc.fill();
        }
    };

    this.highlightJoints = function (dl, dc, mx, my, edited) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i].id !== edited.id) {
                if (this.joints[i].highlightMe(mx, my, dl, dc)) {
                    return true;
                }
            }
        }
        return false;
    };

    this.highlightElements = function (dl, dc, mx, my, edited) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].id !== edited.id) {
                if (this.elements[i].highlightMe(mx, my, dl, dc)) {
                    return true;
                }
            }
        }
        return false;
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
                if (joint !== null)
                    return joint;
            }
        }
        return nullElement;
    };

    elementConstructorTable = [
        Diode
    ];
}

function getElementFromName(name, x, y) {
    for (var i = 0; i < elementConstructorTable.length; i++) {
        if (elementNamesList[i] === name) {
            return new elementConstructorTable[i](x, y);
        }
    }
    return null;
}

