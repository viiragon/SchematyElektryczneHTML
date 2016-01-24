/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale */

function ListAppearer() {
    var gui = new GuiElement(-4 * scale, 3 * scale, 3 * scale, 4 * scale, true);

    gui.childs = [];
    gui.color = 'white';

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
    };

    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x, this.y + this.height / 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = scale / 3;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    };

    return gui;
}

