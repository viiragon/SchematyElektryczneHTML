/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, defaultFont, halfScale */

var BIG_CHOICE = 0, CHECKBOX_CHOICE = 1, TEXT_CHOICE = 2;

function ChoiceTemplate(x, y, width, type) {
    var gui;
    if (type === BIG_CHOICE) {
        gui = new GuiElement(x, y, width, width, true);
    } else {
        gui = new GuiElement(x, y, width - 4 * scale, type === TEXT_CHOICE ? 5 * scale : 3 * scale, true);
    }
    gui.color = 'white';

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
    };

    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
    };

    gui.getValue;

    gui.getCondition;

    if (type === TEXT_CHOICE) {
        gui.drawOnlyMe = function (c, ctx) {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.lineWidth = halfScale;
            ctx.strokeStyle = 'black';
            ctx.stroke();

            ctx.font = 2 * scale + "px " + defaultFont;
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(this.getValue(), this.x + this.width / 2,
                    this.y + scale * 3);
        };
    } else if (type === BIG_CHOICE) {
        gui.drawOnlyMe = function (c, ctx) {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.lineWidth = halfScale;
            ctx.strokeStyle = 'black';
            ctx.stroke();

            if (this.image !== null) {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }

            if (this.getCondition()) {
                ctx.beginPath();
                ctx.rect(this.x + scale, this.y + scale, this.width - 2 * scale, this.height - 2 * scale);
                ctx.lineWidth = halfScale;
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }
        };
    } else if (type === CHECKBOX_CHOICE) {
        gui.drawOnlyMe = function (c, ctx) {
            ctx.beginPath();
            ctx.rect(this.x, this.y, 3 * scale, 3 * scale);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.lineWidth = halfScale;
            ctx.strokeStyle = 'black';
            ctx.stroke();

            if (this.getCondition()) {
                var d = 3 * scale;
                ctx.beginPath();
                ctx.lineWidth = halfScale;
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

            ctx.font = 2 * scale + "px " + defaultFont;
            ctx.fillStyle = "black";
            ctx.textAlign = "left";
            ctx.fillText(this.getValue(), this.x + 4 * scale,
                    this.y + scale * 2);
        };
    }

    return gui;
}

