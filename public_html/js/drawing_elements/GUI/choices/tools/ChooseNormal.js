/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, placingId */

function ChooseNormal(x, y) {
    var gui = new GuiElement(x, y, 10 * scale, 10 * scale, true);
    gui.color = 'white';
    gui.image = getImage('normalIcon');

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
    };

    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
    };

    gui.myClick = function (x, y) {
        mode = MODE_NORMAL;
        placingId = 0;
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = scale / 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

        if (mode === MODE_NORMAL && placingId === 0) {
            ctx.beginPath();
            ctx.rect(this.x + scale, this.y + scale, this.width - 2 * scale, this.height - 2 * scale);
            ctx.lineWidth = scale / 2;
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
    };

    return gui;
}

