/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont */

function ChooseSaveAsPNG(x, y, width) {
    var gui = new GuiElement(x, y, width - 4 * scale, 5 * scale, true);
    gui.color = 'white';

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
    };

    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
    };

    gui.myClick = function (x, y) {
        saveImage();
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = scale / 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.font = 2 * scale + "px " + defaultFont;
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("Save image", this.x + this.width / 2,
                this.y + scale * 3);
    };

    return gui;
}

