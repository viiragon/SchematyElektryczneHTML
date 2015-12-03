/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var DIR_HORIZONTAL = 0, DIR_VERTICAL = 1, DIR_UNDEFINED = -1;

function Line(sx, sy, ex, ey) {
    this.x = sx;
    this.y = sy;
    this.ex = ex;
    this.ey = ey;
    this.id = -1;
    this.direction = DIR_UNDEFINED;

    this.sJoint = new Joint(this, this.x, this.y);
    this.eJoint = new Joint(this, this.ex, this.ey);

    this.setPos = function (x, y) {
        if (Math.abs(this.x - x) > Math.abs(this.y - y)) {
            this.ex = x;
            this.ey = this.y;
            this.direction = DIR_HORIZONTAL;
        } else {
            this.ex = this.x;
            this.ey = y;
            this.direction = DIR_VERTICAL;
        }
        this.eJoint.setPos(this.ex, this.ey);
    };

    this.drawMe = function (c, ctx) {
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.ex, this.ey);
        ctx.strokeStyle = 'black';
        ctx.stroke();
        this.sJoint.drawMe(c, ctx);
        this.eJoint.drawMe(c, ctx);
    };

    this.split = function (x, y) {
        var xs = this.direction === DIR_HORIZONTAL ? x : this.x;
        var ys = this.direction === DIR_HORIZONTAL ? this.y : y;
        var line = new Line(xs, ys, this.ex, this.ey);
        diagram.addElement(line);
        line.direction = this.direction;
        this.ex = xs;
        this.ey = ys;
        line.eJoint = this.eJoint;
        this.eJoint.removeElement(this);
        this.eJoint.addElement(line);
        line.sJoint.addElement(this);
        this.eJoint = line.sJoint;
        return this.eJoint;
    };

    this.simplify = function () {
        this.eJoint.joinElements();
        this.sJoint.joinElements();
    };

    this.isClose = function (x, y) {
        return this.sJoint.isClose(x, y) ? true : this.eJoint.isClose(x, y);
    };

    this.getClosestJoint = function (x, y) {
        if (this.sJoint.isCloseAndFree(x, y)) {
            return this.sJoint;
        } else if (this.eJoint.isCloseAndFree(x, y)) {
            return this.eJoint;
        } else if (this.isCloseWithoutJoints(x, y)) {
            return this.split(x, y);
        }
        return null;
    };

    this.highlightMe = function (x, y, c, ctx) {
        if (this.sJoint.isCloseAndFree(x, y)) {
            return this.sJoint.highlightMe(x, y, c, ctx);
        } else if (this.eJoint.isCloseAndFree(x, y)) {
            return this.eJoint.highlightMe(x, y, c, ctx);
        } else if (this.isCloseWithoutJoints(x, y)) {
            ctx.beginPath();
            if (this.direction === DIR_HORIZONTAL)
                ctx.arc(x, this.y, 4, 0, 2 * Math.PI);
            else
                ctx.arc(this.x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.stroke();
            return true;
        }
    };

    this.isCloseWithoutJoints = function (x, y) {
        var xs, xe, ys, ye;
        if (this.direction === DIR_HORIZONTAL) {
            xs = (this.x < this.ex ? this.x : this.ex) + snapDistance;
            xe = (this.x < this.ex ? this.ex : this.x) - snapDistance;
            ys = this.y - snapDistance;
            ye = this.y + snapDistance;
        } else {
            xs = this.x - snapDistance;
            xe = this.x + snapDistance;
            ys = (this.y < this.ey ? this.y : this.ey) + snapDistance;
            ye = (this.y < this.ey ? this.ey : this.y) - snapDistance;
        }
        return (x > xs && x < xe && y > ys && y < ye);
    };
}


