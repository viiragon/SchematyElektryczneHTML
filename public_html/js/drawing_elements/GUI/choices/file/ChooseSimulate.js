/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont, CROP_ELEMENT, TEXT_CHOICE, IS_SERVER_WORKING, IS_WAITING_FOR_CALCULATION */

function ChooseSimulate(x, y, width) {
    var gui = new ChoiceTemplate(x, y, width, TEXT_CHOICE);

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
    };

    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
    };

    gui.myClick = function (x, y) {
        simulate();
    };

    gui.getValue = function () {
        return IS_WAITING_FOR_CALCULATION ? "Waiting..." : "Simulate";
    };

    return gui;
}

