/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, CON_RIGHT, CON_LEFT, CON_UP, CON_DOWN, TO_RADIANS */

function Diode(x, y) {
    var element = new Element(x, y, "diode");

    element.width = 8 * scale;
    element.placements = [-scale * 4, 0,
        scale * 4, 0];
    element.attachments = [CON_RIGHT, CON_LEFT];
    element.setUpJoints();
    element.doubleRotatable = true;

    element.drawMe = function (c, ctx) {
        for (var i = 0; i < this.joints.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.joints[i].x, this.joints[i].y);
            ctx.lineWidth = scale / 4;
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.direction * TO_RADIANS);
        ctx.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
        ctx.restore();
    };

    return element;
}

