/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale */

function ToolsGUI(x, y, height) {
    var gui = new GuiElement(x, y, scale * 14, height, false);

    gui.childs = [new ChooseNormal(2 * scale, 2 * scale)
                , new ChooseWires(2 * scale, 14 * scale)
                , new ChooseDelete(2 * scale, 26 * scale)
                , new ChooseMoving(2 * scale, 38 * scale)
                , new ChooseElement(2 * scale, 50 * scale)];

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = scale / 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    };

    return gui;
}

