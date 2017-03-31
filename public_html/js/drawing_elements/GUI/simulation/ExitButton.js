/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, defaultFont, halfScale, diagram */

function ExitButton(x, y, width) {
    var gui;
    gui = new GuiElement(x, y, width, width, true);
    gui.color = 'white';
    gui.textColor = 'black';

    gui.myClick = function (x, y) {
        diagram.unloadSimulation();
    };

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
    };

    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = halfScale;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        var d = this.width - 2 * scale;
        ctx.beginPath();
        ctx.lineWidth = halfScale;
        ctx.moveTo(this.x + scale, this.y + scale);
        ctx.lineTo(this.x + scale + d, this.y + scale + d);
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.moveTo(this.x + scale, this.y + scale + d);
        ctx.lineTo(this.x + scale + d, this.y + scale);
        ctx.stroke();
    };

    return gui;
}

