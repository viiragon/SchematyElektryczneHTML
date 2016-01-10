/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Element, DEBUG, Joint */

var JOINT_ELEMENT = 0, NORMAL_ELEMENT = 1;

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
    this.width = width;
    this.height = height;
    scale = Math.floor(Math.min(width, height) / 120);
    snapDistance = scale * 2;
    this.edited = nullElement;
    this.selected = nullElement;

    this.elementId = 0;
    this.jointId = 0;

    this.joints = [];
    this.elements = [];
    this.GUI = [new ToolsAppearer(this.width, this.height), new FileGUIAppearer(this.height)];

    this.placer = new LinePlacer();

    this.addElementInPlace = function (code, x, y) {
        var element = null;
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
        }
        if (element !== null) {
            this.edited = element;
            this.addElementEdited(element);
        }
    };

    this.addJointInPlace = function (x, y) {
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
                    break;
                }
            }
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

    this.addElement = function (element) {
        if (element instanceof Joint) {
            this.joints.push(element);
            element.id = this.jointId++;
        } else {
            this.elements.push(element);
            for (var i = 0; i < this.elementId; i++)
                element.rotate();
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

    this.refreshColors = function (ctx) {
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
    };

    this.drawBackground = function (bgl, bgc) {
        this.clearScreen(bgl, bgc);
        this.drawOnlyBackground(bgl, bgc);
        this.GUI[0].drawOnlyMe(bgl, bgc);
        this.GUI[1].drawOnlyMe(bgl, bgc);
    };

    this.drawBackgroundForImage = function (bgl, bgc, background) {
        if (background) {
            bgc.beginPath();
            bgc.rect(0, 0, bgl.width, bgl.height);
            bgc.fillStyle = 'white';
            bgc.fill();
        } else {
            this.clearScreen(bgl, bgc);
        }
        this.drawOnlyBackground(bgl, bgc);
    };

    this.drawOnlyBackground = function (bgl, bgc) {
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].drawMe(bgl, bgc);
            this.refreshColors(bgc);
        }
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].drawMe(bgl, bgc);
            this.refreshColors(bgc);
        }
    };

    this.drawWorkingLayer = function (dl, dc, mx, my) {
        this.clearScreen(dl, dc);
        this.refreshColors(dc);
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
                this.highlightJoints(dl, dc, this.edited.x, this.edited.y, this.edited);
            }
        } else {
            if (!this.highlightJoints(dl, dc, mx, my, this.edited)) {
                if (!this.highlightElements(dl, dc, mx, my, this.edited)
                        && mode === MODE_JOINTS) {
                    this.drawJoint(dl, dc, mx, my);
                }
            }
        }
        for (var i = 0; i < this.GUI.length; i++) {
            if (this.edited.id === -1) {
                this.GUI[i].onMouseOver(mx, my);
            }
            this.refreshColors(dc);
            this.GUI[i].drawMe(dl, dc);
        }
    };

    this.drawJoint = function (dl, dc, mx, my) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        dc.beginPath();
        dc.arc(mx, my, snapDistance, 0, 2 * Math.PI);
        dc.strokeStyle = 'blue';
        dc.stroke();

        dc.beginPath();
        dc.arc(mx, my, scale / 2, 0, 2 * Math.PI);
        dc.fillStyle = 'black';
        dc.fill();
    };

    this.highlightJoints = function (dl, dc, mx, my, edited) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i].id !== edited.id) {
                this.refreshColors(dc);
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
                this.refreshColors(dc);
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


