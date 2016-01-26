/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, CON_RIGHT, CON_LEFT, CON_UP, CON_DOWN, TO_RADIANS */

function TranjMos(x, y, name) {
    var element = new Element(x, y, name);

    element.width = 8 * scale;
    element.placements = [-element.width / 2, 0,
        scale, -element.width / 2,
        scale, element.width / 2];
    element.attachments = [CON_RIGHT, CON_DOWN, CON_UP];
    element.setUpJoints();

    return element;
}

function NMOS(x, y) {
    return TranjMos(x, y, "nmos");
}

function PMOS(x, y) {
    return TranjMos(x, y, "pmos");
}

