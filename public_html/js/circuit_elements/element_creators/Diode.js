/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, CON_RIGHT, CON_LEFT, CON_UP, CON_DOWN */

function Diode(x, y) {
    var element = new Element(x, y);

    element.width = 12 * scale;
    element.placements = [-scale * 6, 0,
        scale * 6, 0];
    element.attachments = [CON_RIGHT, CON_LEFT];
    element.setUpJoints();

    element.drawMe = function (c, ctx) {
        for (var i = 0; i < this.joints.length; i++) {
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.joints[i].x, this.joints[i].y);
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
    };

    return element;
}

