/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale */

function FileGUIAppearer(wholeHeight) {
    var width = scale * 5;
    var gui = new GuiElement(0, 0, width, wholeHeight, true);

    gui.childs = [new FileGUI(wholeHeight)];
    gui.setUpChildren();
    gui.image = getImage("file");

    gui.myMouseOver = function (x, y) {
        this.childs[0].visible = true;
    };

    gui.drawMe = function (c, ctx) {
        if (this.visible) {
            for (var i = 0; i < this.childs.length; i++) {
                this.childs[i].drawMe(c, ctx);
            }
        }
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = scale / 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.drawImage(this.image, this.x + scale / 2, this.y + scale / 2, this.width - scale, this.width - scale);

        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, scale, 0, 2 * Math.PI);
        ctx.fill();
    };

    return gui;
}

