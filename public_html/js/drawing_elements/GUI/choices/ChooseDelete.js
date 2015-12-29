/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_DELETE */

function ChooseDelete(x, y) {
    var gui = new GuiElement(x, y, 10 * scale, 10 * scale, true);
    gui.color = 'white';

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
    };

    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
    };

    gui.myClick = function (x, y) {
        mode = MODE_DELETE;
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.ix, this.iy, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = scale / 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        var d = snapDistance;
        var x = this.ix + this.width / 2
                , y = this.iy + this.height / 2;
        ctx.beginPath();
        ctx.lineWidth = d / 4;
        ctx.moveTo(x - d, y - d);
        ctx.lineTo(x + d, y + d);
        ctx.strokeStyle = 'red';
        ctx.stroke();

        ctx.moveTo(x - d, y + d);
        ctx.lineTo(x + d, y - d);
        ctx.strokeStyle = 'red';
        ctx.stroke();
    };

    return gui;
}

