/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont, CHECKBOX_CHOICE */

function ChooseEnableCrop(x, y, width) {
    var gui = new ChoiceTemplate(x, y, width, CHECKBOX_CHOICE);
    
    gui.myClick = function (x, y) {
        ENABLE_CROPPING = !ENABLE_CROPPING;
    };
    
    gui.getCondition = function () {
        return ENABLE_CROPPING;
    };
    
    gui.getValue = function () {
        return "Cropping";
    };

    return gui;
}

