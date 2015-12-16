/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Element */

var JOINT_ELEMENT = 0, NORMAL_ELEMENT = 1;

var mode = 0;

var MODE_JOINTS = 0, MODE_DELETE = 1;

var nullElement = {
    id: -1
};

var snapDistance; //Odległość po której obiekt jest wychwytywany

var scale; //Jednostka skali (wielkości) planszy

function distance(sx, sy, ex, ey) {
    return Math.max(Math.abs(sx - ex), Math.abs(sy - ey));
}

function Diagram(width, height) {
    this.width = width;
    this.height = height;
    scale = Math.min(width, height) / 120;
    snapDistance = scale * 2;
    this.edited = nullElement;
    this.selected = nullElement;

    this.elementId = 0;
    this.jointId = 2;

    this.joints = [new Joint(width / 3, height / 2), new Joint(2 * width / 3, height / 2)];
    this.elements = [];
    this.placer = new LinePlacer();

    this.joints[0].id = 0;
    this.joints[1].id = 1;
    this.joints[0].connect(this.joints[1]);

    this.addElementInPlace = function (code, x, y) {
        switch (code) {
            case JOINT_ELEMENT:
                var joint = this.findClosestJoint(x, y, false, this.edited);
                if (joint.id !== -1) {
                    this.edited = joint;
                    this.placer.setEdited(joint);
                }
                break;
            case NORMAL_ELEMENT:
                var element = new Diode(x, y);
                this.edited = element;
                this.addElementEdited(element);
                break;
        }
    };

    this.addElement = function (element) {
        if (element instanceof Joint) {
            this.joints.push(element);
            element.id = this.jointId++;
        } else {
            this.elements.push(element);
            for (var i = 0; i < this.elementId; i++)
                element.rotate();
            element.id = this.elementId++;

            var joint;
            for (var i = 0; i < element.joints.length; i++) {
                joint = element.joints[i];
                console.log(i + "." + joint);
                for (var j = 0; j < 4; j++) {
                    console.log(" " + j + ". " + (joint.joints[j] === null));
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
        if (this.edited instanceof Joint && this.placer.isPlaceable()) {
            var joint = this.findClosestJoint(this.placer.x, this.placer.y, false, this.edited);
            if (joint.id !== -1) {
                this.placer.connect(joint);
            } else {
                this.placer.place();
            }
        } else if (this.edited instanceof Element && this.edited.isPlaceable()) {
            var joint;
            for (var i = 0; i < this.edited.joints.length; i++) {
                joint = this.edited.joints[i];
                joint = this.findClosestJoint(joint.x, joint.y, false, joint);
                if (joint.id !== -1) {
                    this.edited.place(i, joint);
                }
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
        this.clearScreen(bgl, bgc);
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].drawMe(bgl, bgc);
        }
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].drawMe(bgl, bgc);
        }
    };

    this.drawWorkingLayer = function (dl, dc, mx, my) {
        this.clearScreen(dl, dc);
        if (this.edited.id !== -1) {
            if (this.edited instanceof Joint) {
                this.placer.drawMe(dl, dc);
                this.highlightElements(dl, dc, this.placer.x, this.placer.y, this.edited);
            } else if (this.edited instanceof Element) {
                this.edited.drawMe(dl, dc);
                var joint;
                for (var i = 0; i < this.edited.joints.length; i++) {
                    joint = this.edited.joints[i];
                    if (this.highlightElements(dl, dc, joint.x, joint.y, joint)) {
                        break;
                    }
                }
            } else {
                this.edited.drawMe(dl, dc);
                this.highlightElements(dl, dc, this.edited.x, this.edited.y, this.edited);
            }
        } else
            this.highlightElements(dl, dc, mx, my, this.edited);
    };

    this.highlightElements = function (dl, dc, mx, my, edited) {
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i].id !== edited.id) {
                if (this.joints[i].highlightMe(mx, my, dl, dc)) {
                    return true;
                }
            }
        }
        return false;
    };

    this.findClosestJoint = function (mx, my, onlyJoints, exception) {
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i].id !== exception.id) {
                var joint = this.joints[i].getClosestJoint(mx, my, onlyJoints);
                if (joint !== null)
                    return joint;
            }
        }
        return nullElement;
    };
}


