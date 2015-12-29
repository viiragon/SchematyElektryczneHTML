/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale */

function ToolsAppearer(wholeWidth, wholeHeight) {
    var width = scale * 5;
    var gui = new GuiElement(wholeWidth - width, 0, width, wholeHeight, true);

    gui.childs = [new ToolsGUI(-scale * 9, 0, scale * 14, wholeHeight)];
    gui.setUpChildren();

    gui.myMouseOver = function (x, y) {
        this.childs[0].visible = true;
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.ix, this.iy, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = scale / 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc(this.ix + this.width / 2, this.iy + this.height / 2, scale, 0, 2 * Math.PI);
        ctx.fill();
    };

    return gui;
}

