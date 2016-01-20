/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, placingId, BIG_CHOICE */

function ChooseNormal(x, y) {
    var gui = new ChoiceTemplate(x, y, 10 * scale, BIG_CHOICE);
    gui.image = getImage('normalIcon');

    gui.myClick = function (x, y) {
        mode = MODE_NORMAL;
        placingId = 0;
    };
    
    gui.getCondition = function () {
        return mode === MODE_NORMAL && placingId === 0;
    };

    return gui;
}

