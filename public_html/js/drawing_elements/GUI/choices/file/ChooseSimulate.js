/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont, CROP_ELEMENT, TEXT_CHOICE, IS_SERVER_WORKING */

function ChooseSimulate(x, y, width) {
    var gui = new ChoiceTemplate(x, y, width, TEXT_CHOICE);

    gui.myMouseOver = function (x, y) {
        if (IS_SERVER_WORKING) {
            gui.color = 'lightgray';
        }
    };

    gui.myMouseLeave = function (x, y) {
        if (IS_SERVER_WORKING) {
            gui.color = 'white';
        }
    };

    gui.myClick = function (x, y) {
        if (IS_SERVER_WORKING) {
            simulate();
        }
    };

    gui.getValue = function () {
        if (IS_SERVER_WORKING) {
            gui.color = 'white';
            gui.textColor = 'black';
        } else {
            gui.color = 'lightgray';
            gui.textColor = 'gray';
        }
        return "Simulate";
    };

    return gui;
}

