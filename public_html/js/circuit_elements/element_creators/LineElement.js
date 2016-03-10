/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, CON_RIGHT, CON_LEFT, CON_UP, CON_DOWN, TO_RADIANS, lineWidth */

function LineElement(x, y, name) {
    var element = new Element(x, y, name);

    element.width = 8 * scale;
    element.placements = [-element.width / 2, 0,
        element.width / 2, 0];
    element.attachments = [CON_RIGHT, CON_LEFT];
    element.setUpJoints();
    element.doubleRotatable = true;

    return element;
}

function NonRotableLineElement(x, y, name) {
    var element = LineElement(x, y, name);
    element.drawMe = function (c, ctx) {
        if (this.image !== null) {
            ctx.save();
            ctx.translate(this.x, this.y);
            if (this.direction % 2 === 0) {
                ctx.moveTo(-this.width / 2, 0);
                ctx.lineTo(this.width / 2, 0);
            } else {
                ctx.moveTo(0, -this.width / 2);
                ctx.lineTo(0, this.width / 2);
            }
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
            ctx.restore();
        }
    };
    return element;
}