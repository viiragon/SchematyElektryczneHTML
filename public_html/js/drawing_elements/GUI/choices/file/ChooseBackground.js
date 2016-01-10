/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont */

function ChooseBackground(x, y, width) {
    var gui = new GuiElement(x, y, width - 4 * scale, 5 * scale, true);
    gui.color = 'white';

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
    };

    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
    };

    gui.myClick = function (x, y) {
        ENABLE_BACKGROUND = !ENABLE_BACKGROUND;
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, 3 * scale, 3 * scale);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = scale / 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        if (ENABLE_BACKGROUND) {
            var d = 3 * scale;
            ctx.beginPath();
            ctx.lineWidth = scale / 2;
            ctx.moveTo(x, y);
            ctx.lineTo(x + d, y + d);
            ctx.strokeStyle = 'black';
            ctx.stroke();

            ctx.moveTo(x, y + d);
            ctx.lineTo(x + d, y);
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.lineWidth = 1;
        }

        ctx.font = 2 * scale + "px " + defaultFont;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText("Background", this.x + 4 * scale,
                this.y + scale * 2);
    };

    return gui;
}

