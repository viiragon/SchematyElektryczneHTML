/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CON_UP = 1, CON_DOWN = 3, CON_LEFT = 0, CON_RIGHT = 2;

function Element(x, y) {
    this.width = 6 * scale;
    this.joints = [];
    this.placements = [];
    this.attachments = [];
    this.x = x;
    this.y = y;
    this.id = -2;

    this.setUpJoints = function () {
        var joint;
        var length = this.placements.length / 2;
        for (var i = 0; i < length; i++) {
            joint = new Joint(this.x + this.placements[2 * i],
                    this.y + this.placements[2 * i + 1]);
            joint.joints[this.attachments[i]] = this;
            joint.responsible[this.attachments[i]] = false;
            this.joints.push(joint);
            diagram.addElement(joint);
        }
    };

    this.detach = function () {
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].detachOther(this);
            this.joints[i].simplify();
            this.joints[i] = null;
        }
    };

    this.rotate = function () {
        var tmp;
        for (var i = 0; i < this.joints.length; i++) {
            tmp = this.placements[2 * i];
            this.placements[2 * i] = -this.placements[2 * i + 1];
            this.placements[2 * i + 1] = tmp;

            this.joints[i].joints[this.attachments[i]] = null;
            this.joints[i].responsible[this.attachments[i]] = false;

            this.attachments[i] = (this.attachments[i] + 1) % 4;
            this.joints[i].joints[this.attachments[i]] = this;
            this.joints[i].responsible[this.attachments[i]] = false;
        }
    };

    this.place = function (i, endJoint, additional) {
        var joint = this.joints[i];
        if (!additional) {
            this.setPos(this.x + endJoint.x - joint.x,
                    this.y + endJoint.y - joint.y);
        }
        joint.detachOther(this);
        diagram.deleteElement(joint);
        this.joints[i] = endJoint;
        endJoint.joints[this.attachments[i]] = this;
        endJoint.responsible[this.attachments[i]] = false;
        endJoint.simplify();
    };

    this.isPlaceable = function () {
        return true;
    };

    this.setPos = function (x, y) {
        this.x = x;
        this.y = y;
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].setPos(x + this.placements[2 * i], y + this.placements[2 * i + 1]);
        }
    };

    this.drawMe = function (c, ctx) {
    };

    this.highlightMe = function (x, y, c, ctx) {
        return false;
    };
}


