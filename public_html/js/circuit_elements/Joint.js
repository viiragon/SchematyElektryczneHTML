/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global diagram, DEBUG, snapDistance, mode, MODE_DELETE, scale, lineWidth, halfScale, dl, dc, Element, defaultFont */

var CON_UP = 1, CON_DOWN = 3, CON_LEFT = 0, CON_RIGHT = 2, CON_NULL = -1;
var DC_SIMULATION = false;

function Joint(x, y) {
    this.joints = [null, null, null, null];
    this.responsible = [false, false, false, false];
    this.x = x;
    this.y = y;
    this.id = -2;
    this.hasElement = false;
    this.netJoint = null;

    this.wasSpreading = false;
    this.nodeId = "";
    this.simulationValue = "AAA";

    this.clearSpreadData = function () {
        this.wasSpreading = false;
    };

    this.spreadNodeId = function (nodeId) {
        if (!this.wasSpreading) {
            this.nodeId = getIdString("n", nodeId);
            this.wasSpreading = true;
            for (var i = 0; i < this.joints.length; i++) {
                if (this.joints[i] !== null) {
                    if (this.joints[i] instanceof Joint) {
                        this.joints[i].spreadNodeId(nodeId);
                    } else {
                        var element = this.joints[i];
                        var index = element.getJointIndex(this.id);
                        if (index >= 0) {
                            element.getNetElement().netNodes[index] = this;
                        }
                    }
                }
            }
        }
    };

    this.spreadNodeName = function (nodeName) {
        if (!this.wasSpreading) {
            this.nodeId = nodeName;
            this.wasSpreading = true;
            for (var i = 0; i < this.joints.length; i++) {
                if (this.joints[i] !== null) {
                    if (this.joints[i] instanceof Joint) {
                        this.joints[i].spreadNodeName(nodeName);
                    } else {
                        var element = this.joints[i];
                        var index = element.getJointIndex(this.id);
                        if (index >= 0) {
                            element.getNetElement().netNodes[index] = this;
                        }
                    }
                }
            }
        }
    };

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

    this.canItConnect = function (x, y) {
        if (x === this.x) {
            if (y < this.y) {
                return this.joints[CON_UP] === null;
            } else {
                return this.joints[CON_DOWN] === null;
            }
        } else if (y === this.y) {
            if (x < this.x) {
                return this.joints[CON_LEFT] === null;
            } else {
                return this.joints[CON_RIGHT] === null;
            }
        }
        return false;
    };

    this.isFreeInDirection = function (dir) {
        return this.joints[dir] === null;
    };

    this.getFreeDirections = function () {
        var isHor = this.joints[CON_DOWN] === null && this.joints[CON_UP] === null;
        var isVer = this.joints[CON_LEFT] === null && this.joints[CON_RIGHT] === null;
        return {
            free: isHor || isVer,
            horizontal: isHor,
            vertical: isVer,
            up: this.joints[CON_UP] === null,
            down: this.joints[CON_DOWN] === null,
            left: this.joints[CON_LEFT] === null,
            right: this.joints[CON_RIGHT] === null
        };
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

    this.detachOther = function (element) {
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i] === element) {
                this.joints[i] = null;
                this.responsible[i] = false;
            }
        }
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

    this.simplify = function () {
        if (!this.hasElement) {
            if (this.joints[CON_DOWN] === null && this.joints[CON_UP] === null
                    && this.joints[CON_LEFT] !== null && this.joints[CON_RIGHT] !== null
                    && this.joints[CON_LEFT] instanceof Joint && this.joints[CON_RIGHT] instanceof Joint) {
                this.joints[CON_LEFT].connect(this.joints[CON_RIGHT]);
                if (this.netJoint !== null) {
                    this.joints[CON_LEFT].addNetJoint(this.netJoint);
                    this.netJoint = null;
                }
                this.detach();
                diagram.deleteElement(this);
            } else if (this.joints[CON_LEFT] === null && this.joints[CON_RIGHT] === null
                    && this.joints[CON_DOWN] !== null && this.joints[CON_UP] !== null
                    && this.joints[CON_DOWN] instanceof Joint && this.joints[CON_UP] instanceof Joint) {
                this.joints[CON_DOWN].connect(this.joints[CON_UP]);
                if (this.netJoint !== null) {
                    this.joints[CON_DOWN].addNetJoint(this.netJoint);
                    this.netJoint = null;
                }
                this.detach();
                diagram.deleteElement(this);
            }
        }
    };

    this.addNetJoint = function (netJoint) {
        this.netJoint = netJoint;
        if (netJoint !== null) {
            this.netJoint.placement = this.getNetJointPlacement(netJoint);
            if (this.netJoint.placement === CON_NULL) {
                this.centralizeNetJoint();
            }
        }
    };

    this.getNetJointPlacement = function (netJoint) {
        if (netJoint.x === this.x) {
            if (netJoint.y === this.y) {
                return CON_NULL;
            } else {
                if (netJoint.y < this.y && !this.isFreeInDirection(CON_UP)
                        && netJoint.y > this.joints[CON_UP].y) {
                    return CON_UP;
                } else if (netJoint.y > this.y && !this.isFreeInDirection(CON_DOWN)
                        && netJoint.y < this.joints[CON_DOWN].y) {
                    return CON_DOWN;
                } else {
                    return CON_NULL;
                }
            }
        } else if (netJoint.y === this.y) {
            if (netJoint.x < this.x && !this.isFreeInDirection(CON_LEFT)
                    && netJoint.x > this.joints[CON_LEFT].x) {
                return CON_LEFT;
            } else if (netJoint.x > this.x && !this.isFreeInDirection(CON_RIGHT)
                    && netJoint.x < this.joints[CON_RIGHT].x) {
                return CON_RIGHT;
            } else {
                return CON_NULL;
            }
        } else {
            return CON_NULL;
        }
    };

    this.centralizeNetJoint = function () {
        this.netJoint.placement = CON_NULL;
        this.netJoint.setPos(this.x, this.y);
    };

    this.refreshNetJoint = function () {
        if (this.netJoint !== null) {
            this.addNetJoint(this.netJoint);
        }
    };

    this.setPos = function (x, y) {
        this.x = x;
        this.y = y;
    };

    this.isHorizontal = function (direction) {
        return direction % 2 === 0;
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

    this.getClosestPoint = function (x, y) {
        if (this.isClose(x, y)) {
            return {x: this.x, y: this.y};
        }
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i] !== null && this.responsible[i]) {
                if (this.isCloseToLine(x, y, i)) {
                    var ax, ay;
                    if (this.isHorizontal(i)) {
                        ax = x;
                        ay = this.y;
                    }
                    else {
                        ax = this.x;
                        ay = y;
                    }
                    return {x: ax, y: ay};
                }
            }
        }
        return null;
    };

    this.isOnLine = function (x, y, d) {
        var end = this.joints[d];
        if (end !== null) {
            if (this.isHorizontal(d)) {
                if (this.y === y
                        && ((this.x < end.x && x > this.x && x < end.x)
                                || (this.x > end.x && x > end.x && x < this.x)))
                    return true;
            } else {
                if (this.x === x
                        && ((this.y < end.y && y > this.y && y < end.y)
                                || (this.y > end.y && y > end.y && y < this.y)))
                    return true;
            }
        }
        return false;
    };

    this.getExactJoint = function (x, y, onlyJoints) {
        if (this.x === x && this.y === y && this.numberConnected() < 4) {
            return this;
        }
        if (!onlyJoints) {
            for (var i = 0; i < this.joints.length; i++) {
                if (this.joints[i] !== null && this.responsible[i] && this.isOnLine(x, y, i)) {
                    if (true) {
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

    this.drawMe = function (c, ctx) {
        var count = 0;
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i] !== null) {
                count++;
                if (this.responsible[i]) {
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.joints[i].x, this.joints[i].y);
                    ctx.lineWidth = lineWidth;
                    ctx.strokeStyle = 'black';
                    ctx.stroke();
                }
            }
        }
        if (count === 0 || count > 2 || mode === MODE_DELETE) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, halfScale, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
        if (DEBUG) {
            if (this.hasElement)
                ctx.fillStyle = 'blue';
            else
                ctx.fillStyle = 'black';
            ctx.font = "15px Comic Sans MS";
            ctx.textAlign = "center";
            ctx.fillText(this.id, this.x + snapDistance / 2, this.y + snapDistance);
        }
        if (DC_SIMULATION) {
            var sx = this.x, sy = this.y;
            for (var i = 0; i < this.joints.length; i++) {
                if (this.joints[i] !== null && this.responsible[i]) {
                    sx = (this.x + this.joints[i].x) / 2;
                    sy = (this.y + this.joints[i].y) / 2;
                    ctx.fillStyle = 'red';
                    ctx.font = "15px " + defaultFont;
                    if (this.isHorizontal(i)) {
                        ctx.textAlign = "center";
                        ctx.fillText(this.simulationValue, sx, sy - scale);
                    } else {
                        ctx.textAlign = "right";
                        ctx.fillText(this.simulationValue, sx - scale, sy);
                    }
                }
            }
        }
    };

    this.highlightMe = function (x, y, c, ctx) {
        if (this.isCloseAndFree(x, y)) {
            if (mode === MODE_DELETE && this.hasElement) {
                return false;
            }
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

    this.deleteMe = function (x, y) {
        if (this.isClose(x, y)) {
            if (mode === MODE_DELETE && this.hasElement) {
                return false;
            }
            for (var i = 0; i < this.joints.length; i++) {
                if (this.joints[i] !== null) {
                    if (this.netJoint !== null) {
                        this.joints[i].addNetJoint(this.netJoint);
                        this.netJoint = null;
                    }
                    this.joints[i].joints[(i + 2) % 4] = null;
                    this.joints[i].responsible[(i + 2) % 4] = false;
                    this.joints[i].simplify();
                }
            }
            if (this.netJoint !== null) {
                diagram.deleteElement(this.netJoint);
            }
            diagram.deleteElement(this);
            return true;
        }
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i] !== null && this.responsible[i]) {
                if (this.isCloseToLine(x, y, i)) {
                    this.joints[i].joints[(i + 2) % 4] = null;
                    this.joints[i].simplify();
                    this.joints[i] = null;
                    this.responsible[i] = false;
                    this.simplify();
                    return true;
                }
            }
        }
        return false;
    };

    this.cutLines = function (x, y, ex, ey) {
        var tmp;
        var joint;
        if (this.x > x && this.x < ex) {
            if (this.y <= y) {
                tmp = this.joints[CON_DOWN];
                if (tmp !== null && tmp.y > y) {
                    if (tmp.y < ey) {
                        joint = new Joint(this.x, y);
                        diagram.addElement(joint);
                        this.joints[CON_DOWN] = null;
                        tmp.joints[CON_UP] = null;
                        this.connect(joint);
                    } else {
                        joint = new Joint(this.x, y);
                        diagram.addElement(joint);
                        this.joints[CON_DOWN] = null;
                        tmp.joints[CON_UP] = null;
                        this.connect(joint);
                        joint = new Joint(this.x, ey);
                        diagram.addElement(joint);
                        tmp.connect(joint);
                    }
                }
            } else {
                tmp = this.joints[CON_UP];
                if (tmp !== null && tmp.y < ey) {
                    if (tmp.y > y) {
                        joint = new Joint(this.x, ey);
                        diagram.addElement(joint);
                        this.joints[CON_UP] = null;
                        tmp.joints[CON_DOWN] = null;
                        this.connect(joint);
                    }
                }
            }
        } else if (this.y > y && this.y < ey) {
            if (this.x <= x) {
                tmp = this.joints[CON_RIGHT];
                if (tmp !== null && tmp.x > x) {
                    if (tmp.x < ex) {
                        joint = new Joint(x, this.y);
                        diagram.addElement(joint);
                        this.joints[CON_RIGHT] = null;
                        tmp.joints[CON_LEFT] = null;
                        this.connect(joint);
                    } else {
                        joint = new Joint(x, this.y);
                        diagram.addElement(joint);
                        this.joints[CON_RIGHT] = null;
                        tmp.joints[CON_LEFT] = null;
                        this.connect(joint);
                        joint = new Joint(ex, this.y);
                        diagram.addElement(joint);
                        tmp.connect(joint);
                    }
                }
            } else {
                tmp = this.joints[CON_LEFT];
                if (tmp !== null && tmp.x < ex) {
                    if (tmp.x > x) {
                        joint = new Joint(ex, this.y);
                        diagram.addElement(joint);
                        this.joints[CON_LEFT] = null;
                        tmp.joints[CON_RIGHT] = null;
                        this.connect(joint);
                    }
                }
            }
        }
    };

    this.drawHighlight = function (x, y, c, ctx) {
        if (mode !== MODE_DELETE) {
            ctx.beginPath();
            ctx.arc(x, y, 2 * scale / 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = 'blue';
            ctx.stroke();
        } else {
            var d = snapDistance / 2;
            ctx.beginPath();
            ctx.lineWidth = d / 2;
            ctx.moveTo(x - d, y - d);
            ctx.lineTo(x + d, y + d);
            ctx.strokeStyle = 'red';
            ctx.stroke();

            ctx.moveTo(x - d, y + d);
            ctx.lineTo(x + d, y - d);
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
    };

    this.saveMe = function () {
        var attachments = "";
        for (var i = 0; i < 4; i++) {
            if (this.joints[i] !== null) {
                attachments += this.joints[i].id;
            } else {
                attachments += "-";
            }
            if (i !== 3) {
                attachments += "|";
            }
        }
        return "j:" + this.id + ":" + Math.floor(this.x / scale) + ":" + Math.floor(this.y / scale)
                + ":" + attachments + ":" + (this.hasElement ? "1" : "0");
    };

    this.showMe = function () {
        this.drawHighlight(this.x, this.y, dl, dc);
    };
}


