/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Element, DEBUG, Joint, ENABLE_CROPPING, placingId, Cropper */

var JOINT_ELEMENT = 0, NORMAL_ELEMENT = 1, CROP_ELEMENT = 2;

var mode = 0;

var MODE_NORMAL = 0, MODE_JOINTS = 1, MODE_DELETE = 2, MODE_MOVE = 3;

var nullElement = {
    id: -1
};

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
    this.GUI = [new ToolsAppearer(this.windowWidth, this.windowHeight), new FileGUIAppearer(this.windowHeight)];

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
                element = new Diode(x, y);
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

    this.addElementEdited = function (element) {
        this.edited = element;
        this.selected = nullElement;
        this.addElement(element);
    };

    this.moveEdited = function (x, y, dl, dc) {
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

    this.moveDiagram = function (x, y) {
        this.xoffset = Math.min(Math.floor(x / scale) * scale, 0);
        this.yoffset = Math.min(Math.floor(y / scale) * scale, 0);
    };

    this.setAutoCrop = function () {
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
    };

    this.discardEdited = function () {
        if (this.edited instanceof Joint && this.placer.isPlaceable()) {
            var joint = this.findClosestJoint(this.placer.x, this.placer.y, false, this.edited);
            if (joint.id !== -1) {
                this.placer.connect(joint);
            } else {
                this.placer.place();
            }
            this.placer.clear();
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
                    //console.log(tmp.id);
                    tmp.deleteMe(this.edited.getXStart(), tmp.y);
                    tmp.deleteMe(this.edited.getXEnd(), tmp.y);
                    tmp.deleteMe(tmp.x, this.edited.getYStart());
                    tmp.deleteMe(tmp.x, this.edited.getYEnd());
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

    this.deleteSelected = function () {
        if (this.selected.id !== -1) {
            this.deleteElement(this.selected);
            this.selected = nullElement;
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
}


