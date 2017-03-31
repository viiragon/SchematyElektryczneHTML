/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, defaultFont, halfScale */

var BIG_CHOICE = 0, CHECKBOX_CHOICE = 1, TEXT_CHOICE = 2;

function VisibilityButton(x, y) {
    var gui = new GuiElement(x, y, 2 * scale, 2 * scale, true);
    gui.color = 'white';
    gui.textColor = 'black';

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
    };

    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
    };

    gui.getCondition;
    
    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.width);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = halfScale;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        if (this.getCondition()) {
            var d = this.width;
            ctx.beginPath();
            ctx.lineWidth = halfScale * 0.5;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + d, this.y + d);
            ctx.strokeStyle = 'black';
            ctx.stroke();

            ctx.moveTo(this.x, this.y + d);
            ctx.lineTo(this.x + d, this.y);
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.lineWidth = 1;
        }
    };

    return gui;
}

