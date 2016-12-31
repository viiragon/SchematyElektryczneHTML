/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, halfScale */

function FileGUI(height) {
    var gui = new GuiElement(0, 0, scale * 28, height, false);

    gui.childs = [new ChooseNewDiagram(2 * scale, 0, gui.width),
        new ChooseSaveAsPNG(2 * scale, 0, gui.width),
        new ChooseBackground(2 * scale, 0, gui.width),
        new ChooseSaveAsFile(2 * scale, 0, gui.width),
        new ChooseLoadDiagram(2 * scale, 0, gui.width),
        new ChooseEnableCrop(2 * scale, 2 * scale, gui.width),
        new ChooseCrop(2 * scale, 0, gui.width),
        new ChooseAutoCrop(2 * scale, 0, gui.width),
        new ChooseSimulate(2 * scale, 2 * scale, gui.width),
        new ChooseHelp(2 * scale, 0, gui.width)];

    var delta = 2 * scale;
    var sep = 0;
    var i;
    for (i = 0; i < gui.childs.length - 1; i++) {
        sep = gui.childs[i].iy;
        gui.childs[i].iy += delta;
        delta += gui.childs[i].height + sep + 2 * scale;
    }
    gui.childs[i].iy = height - 2 * scale - gui.childs[i].height;

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = halfScale;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    };

    return gui;
}

