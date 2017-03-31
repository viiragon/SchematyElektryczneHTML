/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, CON_RIGHT, CON_LEFT, CON_UP, CON_DOWN, TO_RADIANS, NULL_NODE */

function Ground(x, y, name) {
    var element = new Element(x, y, name);

    element.width = 8 * scale;
    element.placements = [0, -element.width / 2];
    element.attachments = [CON_DOWN];
    element.isGround = true;
    element.setUpJoints();

    element.setUpNetNodes = function () {
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].spreadNodeName("gnd");
        }
    };

    return element;
}

function EarthGround(x, y) {
    return Ground(x, y, "earthGround");
}

function ChassisGround(x, y) {
    return Ground(x, y, "chassisGround");
}

