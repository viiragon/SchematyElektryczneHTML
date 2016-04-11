/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global diagram, snapDistance, scale, lineWidth */

var DIR_HORIZONTAL = 0, DIR_VERTICAL = 1;

function LinePlacer() {
    this.x = null;
    this.y = null;
    this.sx = null;
    this.sy = null;
    this.edited = null;
    this.direction = 0;
    this.frees;

    this.setEdited = function (edited) {
        this.edited = edited;
        this.frees = edited.getFreeDirections();
    };

    this.connect = function (endJoint) {
        if (this.sx === null && this.sy === null) {
            if (endJoint.x === this.edited.x || endJoint.y === this.edited.y) {
                this.edited.connect(endJoint);
            } else {
                var free = this.edited.getFreeDirections();
                if (free.free) {
                    if (free.horizontal) {
                        this.edited.x = endJoint.x;
                    } else {
                        this.edited.y = endJoint.y;
                    }
                    this.edited.connect(endJoint);
                } else if ((free = endJoint.getFreeDirections()).free) {
                    if (free.horizontal) {
                        endJoint.x = this.edited.x;
                    } else {
                        endJoint.y = this.edited.y;
                    }
                    this.edited.connect(endJoint);
                }
            }
        } else {
            if (endJoint.x !== this.sx && endJoint.y !== this.sy) {
                if (this.direction === DIR_HORIZONTAL) {
                    this.sx = endJoint.x;
                } else {
                    this.sy = endJoint.y;
                }
            }
            if (endJoint.canItConnect(this.sx, this.sy)) {
                var segment = new Joint(this.sx, this.sy);
                diagram.addElement(segment);
                this.edited.connect(segment);
                segment.connect(endJoint);
            }
        }
        this.edited.simplify();
        endJoint.simplify();
    };

    this.isPlaceable = function () {
        return this.x !== null && this.y !== null;
    };

    this.place = function () {
        var endJoint = new Joint(this.x, this.y);
        diagram.addElement(endJoint);
        this.connect(endJoint);
    };

    this.clear = function () {
        this.x = null;
        this.y = null;
        this.sx = null;
        this.sy = null;
        this.edited = null;
    };

    this.edit = function (x, y) {
        if (Math.abs(x - this.edited.x) < snapDistance) {
            if ((y > this.edited.y && this.frees.down) || (y < this.edited.y && this.frees.up)) {
                this.x = this.edited.x;
                this.y = y;
                this.direction = DIR_VERTICAL;
                this.sx = null;
                this.sy = null;
                return;
            }
        } else if (Math.abs(y - this.edited.y) < snapDistance) {
            if ((x > this.edited.x && this.frees.right) || (x < this.edited.x && this.frees.left)) {
                this.x = x;
                this.y = this.edited.y;
                this.direction = DIR_HORIZONTAL;
                this.sx = null;
                this.sy = null;
                return;
            }
        } else {
            this.x = x;
            this.y = y;
            if (this.direction === DIR_HORIZONTAL) {
                if ((x > this.edited.x && this.frees.right) || (x < this.edited.x && this.frees.left)) {
                    this.sx = x;
                    this.sy = this.edited.y;
                    return;
                }
            } else {
                if ((y > this.edited.y && this.frees.down) || (y < this.edited.y && this.frees.up)) {
                    this.sx = this.edited.x;
                    this.sy = y;
                    return;
                }
            }
        }
        this.x = null;
        this.y = null;
        this.sx = null;
        this.sy = null;
    };

    this.drawMe = function (c, ctx) {
        if (this.isPlaceable()) {
            ctx.save();
            ctx.setLineDash([scale, scale]);
            if (this.sx === null && this.sy === null) {
                ctx.moveTo(this.edited.x, this.edited.y);
                if (this.direction === DIR_HORIZONTAL) {
                    ctx.lineTo(this.x, this.edited.y);
                } else {
                    ctx.lineTo(this.edited.x, this.y);
                }
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = 'lightgrey';
                ctx.stroke();
            } else {
                ctx.moveTo(this.edited.x, this.edited.y);
                ctx.lineTo(this.sx, this.sy);
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = 'lightgrey';
                ctx.stroke();

                ctx.moveTo(this.sx, this.sy);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
            }
            ctx.restore();
        }
    };
}


