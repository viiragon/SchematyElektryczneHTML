/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont, BIG_CHOICE */

function ChooseElement(x, y) {
    var gui = new ChoiceTemplate(x, y, 10 * scale, BIG_CHOICE);
    gui.element = "diode";
    gui.image = getImage('diodeElement');

    gui.myClick = function (x, y) {
        placingId = 1;
        mode = MODE_NORMAL;
        placingElement = this.element;
    };

    gui.getCondition = function () {
        return mode === MODE_NORMAL && placingId > 0;
    };

    gui.setElement = function (name) {
        this.element = name;
        this.image = getImage(name + 'Element');
    };

    return gui;
}

