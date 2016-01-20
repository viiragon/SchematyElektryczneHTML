/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale */

function FileGUI(height) {
    var gui = new GuiElement(0, 0, scale * 28, height, false);

    gui.childs = [new ChooseSaveAsPNG(2 * scale, 2 * scale, gui.width), 
                new ChooseBackground(2 * scale, 9 * scale, gui.width),
                new ChooseCrop(2 * scale, 14 * scale, gui.width), 
                new ChooseEnableCrop(2 * scale, 21 * scale, gui.width), 
                new ChooseAutoCrop(2 * scale, 26 * scale, gui.width)];

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

