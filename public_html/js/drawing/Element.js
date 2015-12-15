/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CON_UP = 1, CON_DOWN = 3, CON_LEFT = 0, CON_RIGHT = 2;

function Element(x, y) {
    this.width = 3 * snapDistance;
    this.joints = [new Joint(x - this.width / 2, y), new Joint(x + this.width / 2, y)];
    this.x = x;
    this.y = y;
    this.id = -2;

    this.joints[0].joints[CON_RIGHT] = this;
    this.joints[0].responsible[CON_RIGHT] = false;
    this.joints[1].joints[CON_LEFT] = this;
    this.joints[1].responsible[CON_LEFT] = false;
    diagram.addElement(this.joints[0]);
    diagram.addElement(this.joints[1]);

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

    this.setPos = function (x, y) {
        this.x = x;
        this.y = y;
        this.joints[0].setPos(x - this.width / 2, y);
        this.joints[1].setPos(x + this.width / 2, y);
    };

    this.drawMe = function (c, ctx) {
        ctx.moveTo(this.x - this.width / 3, this.y);
        ctx.lineTo(this.joints[0].x, this.joints[0].y);
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.moveTo(this.x + this.width / 3, this.y);
        ctx.lineTo(this.joints[1].x, this.joints[1].y);
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
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


