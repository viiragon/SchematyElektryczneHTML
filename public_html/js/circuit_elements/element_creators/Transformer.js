/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, CON_RIGHT, CON_LEFT, CON_UP, CON_DOWN, TO_RADIANS */

function Transformer(x, y) {
    var element = new Element(x, y, "transformer");

    element.width = 8 * scale;
    var d = 3 * scale; 
    element.placements = [-d, -d,
        -d, d,
        d, -d,
        d, d];
    element.attachments = [CON_RIGHT, CON_RIGHT, CON_LEFT, CON_LEFT];
    element.setUpJoints();

    return element;
}

