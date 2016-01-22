/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global diagram, scale, snapDistance, mode, MODE_DELETE */

var TO_RADIANS = Math.PI / 2;

function Element(x, y, name) {
    this.width = 6 * scale;
    this.joints = [];
    this.placements = [];
    this.attachments = [];
    this.x = x;
    this.y = y;
    this.id = -2;
    this.direction = 0;
    this.placed = false;
    this.doubleRotatable = false;
    this.name = name;
    this.image = getImage(name + "Element");

    this.setUpJoints = function () {
        var joint;
        var length = this.placements.length / 2;
        for (var i = 0; i < length; i++) {
            joint = new Joint(this.x + this.placements[2 * i],
                    this.y + this.placements[2 * i + 1]);
            joint.joints[this.attachments[i]] = this;
            joint.responsible[this.attachments[i]] = false;
            joint.hasElement = true;
            this.joints.push(joint);
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
        if (!this.placed) {
            var tmp;
            this.direction = (this.direction + 1) % 4;
            for (var i = 0; i < this.joints.length; i++) {
                tmp = this.placements[2 * i];
                this.placements[2 * i] = this.placements[2 * i + 1];
                this.placements[2 * i + 1] = -tmp;
                this.joints[i].setPos(this.x + this.placements[2 * i], this.y + this.placements[2 * i + 1]);

                this.joints[i].joints[this.attachments[i]] = null;
                this.joints[i].responsible[this.attachments[i]] = false;

                this.attachments[i] = (this.attachments[i] - 1) % 4;
                if (this.attachments[i] < 0) {
                    this.attachments[i] += 4;
                }
                this.joints[i].joints[this.attachments[i]] = this;
                this.joints[i].responsible[this.attachments[i]] = false;
            }
        } else if (this.doubleRotatable) {
            this.direction = (this.direction + 2) % 4;
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
        endJoint.hasElement = true;
        endJoint.simplify();
    };

    this.isPlaceable = function () {
        return true;
    };

    this.areJointsClose = function (x, y) {
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i].isClose(x, y)) {
                return true;
            }
        }
        return false;
    };

    this.setPos = function (x, y) {
        this.x = x;
        this.y = y;
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].setPos(x + this.placements[2 * i], y + this.placements[2 * i + 1]);
        }
    };

    this.isClose = function (x, y) {
        return distance(x, y, this.x, this.y) < this.width / 2;
    };

    this.highlightMe = function (x, y, c, ctx) {
        if (this.isClose(x, y)) {
            if (mode !== MODE_DELETE) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width / 2.5, 0, 2 * Math.PI);
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = scale / 4;
                ctx.stroke();
            } else {
                var d = this.width / 3;
                ctx.lineWidth = snapDistance / 3;
                ctx.moveTo(this.x - d, this.y - d);
                ctx.lineTo(this.x + d, this.y + d);
                ctx.strokeStyle = 'red';
                ctx.stroke();

                ctx.moveTo(this.x - d, this.y + d);
                ctx.lineTo(this.x + d, this.y - d);
                ctx.strokeStyle = 'red';
                ctx.stroke();
                ctx.lineWidth = 1;
            }
            return true;
        }
        return false;
    };

    this.deleteMe = function (x, y) {
        if (this.isClose(x, y)) {
            for (var i = 0; i < this.joints.length; i++) {
                if (this.joints[i].numberConnected() > 1) {
                    this.joints[i].detachOther(this);
                    this.joints[i].hasElement = false;
                    this.joints[i].simplify();
                } else {
                    diagram.deleteElement(this.joints[i]);
                }
            }
            diagram.deleteElement(this);
            return true;
        }
        return false;
    };
    
    this.saveMe = function () {
        var joints = "";
        for (var i = 0; i < this.joints.length; i++) {
            joints += this.joints[i].id;
            if (i !== this.joints.length - 1) {
                joints += "|";
            }
        }
        return "e:" + this.id + ":" + this.name + ":" + (this.x / scale) + ":" + (this.y / scale)
                + ":" + this.direction + ":" + joints;
    };

    this.drawMe = function (c, ctx) {
    };
}


