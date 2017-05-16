/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale */

function ListAppearer(parent) {
    var gui = new GuiElement(-4 * scale, 2 * scale, 5 * scale, 6 * scale, true);

    gui.childs = [listCreator(parent)];

    gui.showList = function () {
        this.childs[0].visible = true;
        this.childs[0].largerWidth = true;
    };

    return gui;
}

