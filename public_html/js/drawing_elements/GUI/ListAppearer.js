/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale */

function ListAppearer(parent) {
    var gui = new GuiElement(-6 * scale, 2 * scale, 5 * scale, 6 * scale, true);

    gui.childs = [listCreator(parent)];
    gui.color = 'white';

    gui.myClick = function (x, y) {
        this.childs[0].visible = true;
    };

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
        //this.childs[0].visible = true;
    };

    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = scale / 3;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    };

    return gui;
}

