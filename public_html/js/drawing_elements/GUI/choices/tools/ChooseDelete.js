/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_DELETE, snapDistance, BIG_CHOICE */

function ChooseDelete(x, y) {
    var gui = new ChoiceTemplate(x, y, 10 * scale, BIG_CHOICE);
    gui.image = getImage('deleteIcon');

    gui.myClick = function (x, y) {
        mode = MODE_DELETE;
    };
    
    gui.getCondition = function () {
        return mode === MODE_DELETE;
    };

    return gui;
}

