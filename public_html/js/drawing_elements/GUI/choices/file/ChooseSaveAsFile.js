/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont, TEXT_CHOICE */

function ChooseSaveAsFile(x, y, width) {
    var gui = new ChoiceTemplate(x, y, width, TEXT_CHOICE);
    
    gui.myClick = function (x, y) {
        saveDiagramToFile();
    };

    gui.getValue = function () {
        return "Save file";
    };

    return gui;
}

