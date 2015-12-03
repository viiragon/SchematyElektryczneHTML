/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Joint(element, x, y) {
    this.elements = [element];
    this.x = x;
    this.y = y;
    this.id = 0;

    this.addElement = function (element) {
        this.elements.push(element);
    };
    this.getElement = function (id) {
        return this.elements[id];
    };
    this.removeElement = function (element) {
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i] === element) {
                this.elements.splice(i, 1);
            }
        }
    };
    this.joinElements = function () {
        if (this.elements.length === 2) {
            var l1 = this.elements[0];
            var l2 = this.elements[1];

            if ((l1 instanceof Line) && (l2 instanceof Line)
                    && (l1.direction === l2.direction)) {
                var sJoint = (l1.sJoint === this ? l1.eJoint : l1.sJoint);
                var eJoint = (l2.sJoint === this ? l2.eJoint : l2.sJoint);
                l1.x = sJoint.x;
                l1.y = sJoint.y;
                l1.sJoint = sJoint;
                l1.ex = eJoint.x;
                l1.ey = eJoint.y;
                l1.eJoint = eJoint;
                diagram.deleteElement(l2);
                return true;
            }
        }
        return false;
    };

    this.setPos = function (x, y) {
        this.x = x;
        this.y = y;
    };
    this.drawMe = function (c, ctx) {
        if (this.elements.length > 2) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.stroke();
        }
    };
    this.isClose = function (x, y) {
        return distance(x, y, this.x, this.y) < snapDistance;
    };
    this.isCloseAndFree = function (x, y) {
        return this.elements.length < 4 && this.isClose(x, y);
    };
    this.highlightMe = function (x, y, c, ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
        return true;
    };
}


