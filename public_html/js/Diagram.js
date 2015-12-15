/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var JOINT_ELEMENT = 0, NORMAL_ELEMENT = 1;

var mode = 0;

var MODE_JOINTS = 0, MODE_DELETE = 1;

var nullElement = {
    id: -1
};

var snapDistance; //Odległość po której obiekt jest wychwytywany

function distance(sx, sy, ex, ey) {
    return Math.max(Math.abs(sx - ex), Math.abs(sy - ey));
}

function Diagram(width, height) {
    this.width = width;
    this.height = height;
    snapDistance = Math.min(width, height) / 40;
    this.edited = nullElement;
    this.selected = nullElement;

    this.elementId = 0;
    this.jointId = 2;

    this.joints = [new Joint(width / 3, height / 2), new Joint(2 * width / 3, height / 2)];
    this.elements = [];
    
    this.joints[0].id = 0;
    this.joints[1].id = 1;
    this.joints[0].connect(this.joints[1]);

    this.addElementInPlace = function (code, x, y) {
        switch (code) {
            case JOINT_ELEMENT:
                var joint = this.findClosestJoint(x, y, false);
                if (joint.id !== -1) {
                    var newJoint = new Joint(joint.x, joint.y);
                    this.edited = newJoint;
                    this.addElementEdited(newJoint);
                    this.selected = joint;
                }
                break;
            case NORMAL_ELEMENT:
                var element = new Element(x, y);
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
            element.id = this.elementId++;
        }
    };

    this.addElementEdited = function (element) {
        this.edited = element;
        this.selected = nullElement;
        this.addElement(element);
    };

    this.moveEdited = function (x, y, dl, dc) {
        if (this.edited.id !== -1) {
            if (this.edited instanceof Joint) {
                if (Math.abs(this.selected.x - x) > Math.abs(this.selected.y - y)) {
                    if (this.selected.x - x > 0) {
                        this.edited.edit(x, y, this.selected, CON_LEFT);
                    } else {
                        this.edited.edit(x, y, this.selected, CON_RIGHT);
                    }
                } else {
                    if (this.selected.y - y > 0) {
                        this.edited.edit(x, y, this.selected, CON_UP);
                    } else {
                        this.edited.edit(x, y, this.selected, CON_DOWN);
                    }
                }
            } else {
                this.edited.setPos(x, y);
            }
        }
    };

    this.discardEdited = function () {
        if (this.edited instanceof Joint) {
            if (this.selected.isClose(this.edited.x, this.edited.y)) {
                this.deleteElement(this.edited);
                this.edited = nullElement;
            } else {
                var done = false;
                var joint = this.findClosestJoint(this.edited.x, this.edited.y, true);
                if (joint.id !== -1) {
                    var dirs = joint.getFreeDirections();
                    var myDirs = this.edited.getFreeDirections();
                    if (dirs.free) {
                        if (myDirs.vertical && dirs.horizontal) {
                            joint.x = this.edited.x;
                            done = true;
                        } else if (myDirs.horizontal && dirs.vertical) {
                            joint.y = this.edited.y;
                            done = true;
                        }
                        if (done) {
                            this.addElement(joint);
                            this.selected.connect(joint);
                            this.deleteElement(this.edited);
                        }
                    }
                }
                if (!done) {
                    var jointInLines = this.findClosestJoint(this.edited.x, this.edited.y, false);
                    if (jointInLines.id !== -1 && jointInLines !== joint) {
                        this.addElement(jointInLines);
                        this.selected.connect(jointInLines);
                        this.deleteElement(this.edited);
                    } else {
                        this.selected.connect(this.edited);
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
        lc.rect(0, 0, l.width, l.height);
        lc.fillStyle = 'white';
        lc.fill();
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
            this.edited.drawMe(dl, dc);
            this.highlightElements(dl, dc, this.edited.x, this.edited.y);
        } else
            this.highlightElements(dl, dc, mx, my);
    };

    this.highlightElements = function (dl, dc, mx, my) {
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i].id !== this.edited.id) {
                if (this.joints[i].highlightMe(mx, my, dl, dc)) {
                    break;
                }
            }
        }
    };

    this.findClosestJoint = function (mx, my, onlyJoints) {
        for (var i = 0; i < this.joints.length; i++) {
            var joint = this.joints[i].getClosestJoint(mx, my, onlyJoints);
            if (joint !== null)
                return joint;
        }
        return nullElement;
    };
}


