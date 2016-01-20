/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont, CHECKBOX_CHOICE */

function ChooseBackground(x, y, width) {
    var gui = new ChoiceTemplate(x, y, width, CHECKBOX_CHOICE);
    
    gui.myClick = function (x, y) {
        ENABLE_BACKGROUND = !ENABLE_BACKGROUND;
    };
    
    gui.getCondition = function () {
        return ENABLE_BACKGROUND;
    };
    
    gui.getValue = function () {
        return "Background";
    };

    return gui;
}

