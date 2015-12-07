/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CON_UP = 1, CON_DOWN = 3, CON_LEFT = 0, CON_RIGHT = 2;

function Joint(x, y) {
    this.joints = [null, null, null, null];
    this.responsible = [false, false, false, false];
    this.x = x;
    this.y = y;
    this.id = -2;

    this.connect = function (joint) {
        if (joint.x === this.x) {
            if (joint.y < this.y) {
                this.connectInDirection(joint, CON_UP);
            } else {
                this.connectInDirection(joint, CON_DOWN);
            }
            return true;
        } else if (joint.y === this.y) {
            if (joint.x < this.x) {
                this.connectInDirection(joint, CON_LEFT);
            } else {
                this.connectInDirection(joint, CON_RIGHT);
            }
            return true;
        }
        return false;
    };

    this.isConnected = function (direction) {
        return this.joints[direction] !== null;
    };

    this.getFreeDirections = function () {
        var isHor = this.joints[CON_DOWN] === null && this.joints[CON_UP] === null;
        var isVer = this.joints[CON_LEFT] === null && this.joints[CON_RIGHT] === null;
        return {
            free: isHor || isVer,
            horizontal: isHor,
            vertical: isVer
        };
    };

    this.connectInDirection = function (joint, myDirection) {
        var jointDirection = (myDirection + 2) % 4;
        this.joints[myDirection] = joint;
        joint.joints[jointDirection] = this;
        if (joint.id > this.id) {
            this.responsible[myDirection] = false;
            joint.responsible[jointDirection] = true;
        } else {
            this.responsible[myDirection] = true;
            joint.responsible[jointDirection] = false;
        }
    };

    this.numberConnected = function () {
        var count = 0;
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i] !== null) {
                count++;
            }
        }
        return count;
    };

    this.detach = function () {
        this.joints[0] = null;
        this.joints[1] = null;
        this.joints[2] = null;
        this.joints[3] = null;
        this.responsible[0] = false;
        this.responsible[1] = false;
        this.responsible[2] = false;
        this.responsible[3] = false;
    };

    this.edit = function (x, y, root, direction) {
        if (!root.isConnected(direction)) {
            this.detach();
            this.joints[(direction + 2) % 4] = root;
            this.responsible[(direction + 2) % 4] = true;
            if (this.isHorizontal(direction)) {
                this.setPos(x, root.y);
            } else {
                this.setPos(root.x, y);
            }
        }
    };

    this.setPos = function (x, y) {
        this.x = x;
        this.y = y;
    };

    this.isHorizontal = function (direction) {
        return direction % 2 === 0;
    };

    this.drawMe = function (c, ctx) {
        var count = 0;
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i] !== null) {
                count++;
                if (this.responsible[i]) {
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.joints[i].x, this.joints[i].y);
                    ctx.strokeStyle = 'black';
                    ctx.stroke();
                }
            }
        }
        if (count > 2) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
        if (DEBUG) {
            ctx.stroke();
            ctx.fillStyle = 'black';
            ctx.font = "15px Comic Sans MS";
            ctx.textAlign = "center";
            ctx.fillText(this.id, this.x + snapDistance / 2, this.y + snapDistance);
        }
    };

    this.isClose = function (x, y) {
        return distance(x, y, this.x, this.y) < snapDistance;
    };

    this.isCloseAndFree = function (x, y) {
        return this.isClose(x, y) && this.numberConnected() < 4;
    };

    this.isCloseToLine = function (x, y, d) {
        var xs, xe, ys, ye;
        var end = this.joints[d];
        if (this.isHorizontal(d)) {
            xs = (this.x < end.x ? this.x : end.x) + snapDistance;
            xe = (this.x < end.x ? end.x : this.x) - snapDistance;
            ys = this.y - snapDistance;
            ye = this.y + snapDistance;
        } else {
            xs = this.x - snapDistance;
            xe = this.x + snapDistance;
            ys = (this.y < end.y ? this.y : end.y) + snapDistance;
            ye = (this.y < end.y ? end.y : this.y) - snapDistance;
        }
        return (x > xs && x < xe && y > ys && y < ye);
    };

    this.getClosestJoint = function (x, y, onlyJoints) {
        if (this.isCloseAndFree(x, y)) {
            return this;
        }
        if (!onlyJoints) {
            for (var i = 0; i < this.joints.length; i++) {
                if (this.joints[i] !== null && this.responsible[i]) {
                    if (this.isCloseToLine(x, y, i)) {
                        var joint;
                        if (this.isHorizontal(i))
                            joint = new Joint(x, this.y);
                        else
                            joint = new Joint(this.x, y);
                        diagram.addElement(joint);
                        this.joints[i].connect(joint);
                        this.connect(joint);
                        return joint;
                    }
                }
            }
        }
        return null;
    };

    this.highlightMe = function (x, y, c, ctx) {
        if (this.isCloseAndFree(x, y)) {
            this.drawHighlight(this.x, this.y, c, ctx);
            return true;
        }
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i] !== null && this.responsible[i]) {
                if (this.isCloseToLine(x, y, i)) {
                    if (this.isHorizontal(i))
                        this.drawHighlight(x, this.y, c, ctx);
                    else
                        this.drawHighlight(this.x, y, c, ctx);
                    return true;
                }
            }
        }
        return false;
    };

    this.drawHighlight = function (x, y, c, ctx) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
    };
}


