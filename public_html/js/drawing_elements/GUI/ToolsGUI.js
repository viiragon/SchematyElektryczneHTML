/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale */

function ToolsGUI(x, y, height) {
    var gui = new GuiElement(x, y, scale * 14, height, false);

    gui.childs = [new ChooseNormal(2 * scale, 0)
                , new ChooseWires(2 * scale, 0)
                , new ChooseDelete(2 * scale, 0)
                , new ChooseMoving(2 * scale, 0)
                , new ChooseElement(2 * scale, 0)];

    var delta = 2 * scale;
    var sep = 0;
    for (var i = 0; i < gui.childs.length; i++) {
        sep = gui.childs[i].iy;
        gui.childs[i].iy += delta;
        delta += gui.childs[i].height + sep + 2 * scale;
    }

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

