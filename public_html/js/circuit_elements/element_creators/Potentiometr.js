/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, CON_RIGHT, CON_LEFT, CON_UP, CON_DOWN, TO_RADIANS */

function Potentiometr(x, y, name) {
    var element = new Element(x, y, name);

    element.width = 8 * scale;
    element.placements = [-element.width / 2, 0,
        element.width / 2, 0,
        0, element.width / 2];
    element.attachments = [CON_RIGHT, CON_LEFT, CON_UP];
    element.setUpJoints();

    return element;
}

function PotentiometrIEEE(x, y) {
    return Potentiometr(x, y, "potentiometrIEEE");
}

function PotentiometrIEC(x, y) {
    return Potentiometr(x, y, "potentiometrIEC");
}

