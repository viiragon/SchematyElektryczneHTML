/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont, CROP_ELEMENT, TEXT_CHOICE */

function ChooseCrop(x, y, width) {
    var gui = new ChoiceTemplate(x, y, width, TEXT_CHOICE);
    
    gui.myClick = function (x, y) {
        placingId = CROP_ELEMENT;
        mode = MODE_NORMAL;
    };

    gui.getValue = function () {
        return "Set crop area";
    };

    return gui;
}

