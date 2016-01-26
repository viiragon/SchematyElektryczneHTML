/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, CON_RIGHT, CON_LEFT, CON_UP, CON_DOWN, TO_RADIANS */

function SpstToggle(x, y) {
    var element = new Element(x, y, "spstToggle");

    element.width = 8 * scale;
    element.placements = [-element.width / 2, 0,
        element.width / 2, -element.width / 4,
        element.width / 2, element.width / 4];
    element.attachments = [CON_RIGHT, CON_LEFT, CON_LEFT];
    element.setUpJoints();

    return element;
}

