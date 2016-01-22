/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont, CROP_ELEMENT, TEXT_CHOICE */

function ChooseNewDiagram(x, y, width) {
    var gui = new ChoiceTemplate(x, y, width, TEXT_CHOICE);
    
    gui.myClick = function (x, y) {
        if (confirm("Are you sure you want to clear this diagram?\nAny unsaved progress will be lost!")) {
            clearDiagram();
        }
    };

    gui.getValue = function () {
        return "New Diagram";
    };

    return gui;
}

