/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, CON_RIGHT, CON_LEFT, CON_UP, CON_DOWN, TO_RADIANS, lineWidth */

function LineElement(x, y, name) {
    var element = new Element(x, y, name);

    element.width = 8 * scale;
    element.placements = [-element.width / 2, 0,
        element.width / 2, 0];
    element.attachments = [CON_RIGHT, CON_LEFT];
    element.setUpJoints();
    element.doubleRotatable = true;

    return element;
}

function Resistor(x, y, name) {
    var element = LineElement(x, y, name);

    var net = element.getNetElement();
    net.netName = "R";
    net.netParametersIDs = ["R", "Temp"];
    net.netParametersValues = ["1 kOhm", "26.85"];
    net.netParametersNames = ["Resistance", "Temperature"];
    net.netParametersVisibility = [true, false];
    net.setUpList();

    return element;
}

function Capacitor(x, y, name) {
    var element = LineElement(x, y, name);

    var net = element.getNetElement();
    net.netName = "C";
    net.netParametersIDs = ["C", "V"];
    net.netParametersValues = ["1 nF", "0 V"];
    net.netParametersNames = ["Capacity", "Init. Voltage"];
    net.netParametersVisibility = [true, false];
    net.setUpList();

    return element;
}

function Inductor(x, y, name) {
    var element = LineElement(x, y, name);

    var net = element.getNetElement();
    net.netName = "L";
    net.netParametersIDs = ["L", "I"];
    net.netParametersValues = ["1 nH", "0 A"];
    net.netParametersNames = ["Inductance", "Init. Current"];
    net.netParametersVisibility = [true, false];
    net.setUpList();

    return element;
}

function DCVoltageSource(x, y, name) {
    var element = LineElement(x, y, name);

    var net = element.getNetElement();
    net.netName = "Vdc";
    net.netParametersIDs = ["U"];
    net.netParametersValues = ["1 V"];
    net.netParametersNames = ["Voltage"];
    net.netParametersVisibility = [true];
    net.setUpList();

    return element;
}

function ACVoltageSource(x, y, name) {
    var element = NonRotableLineElement(x, y, name);

    var net = element.getNetElement();
    net.netName = "Vac";
    net.netParametersIDs = ["U", "f"];
    net.netParametersValues = ["1 V", "1 MHz"];
    net.netParametersNames = ["Peak voltage", "Frequency"];
    net.netParametersVisibility = [true, true];
    net.setUpList();

    return element;
}

function Diode(x, y, name) {
    var element = LineElement(x, y, name);

    var net = element.getNetElement();
    net.netName = "Diode";
    net.netParametersIDs = ["Is", "N", "Cj0", "M", "Vj"];
    net.netParametersValues = ["1e-15 A", "1", "10 fT", "0.5", "0.7 V"];
    net.netParametersNames = ["Saturation current", "Emission coefficient"
        , "Zero-bias junction capacitance", "Grading coefficient", "Junction potential"];
    net.netParametersVisibility = [false, false, false, false, false];
    net.setUpList();

    return element;
}

function NonRotableLineElement(x, y, name) {
    var element = LineElement(x, y, name);
    element.drawMe = function (c, ctx) {
        if (this.image !== null) {
            ctx.save();
            ctx.translate(this.x, this.y);
            if (this.direction % 2 === 0) {
                ctx.moveTo(-this.width / 2, 0);
                ctx.lineTo(this.width / 2, 0);
            } else {
                ctx.moveTo(0, -this.width / 2);
                ctx.lineTo(0, this.width / 2);
            }
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
            ctx.restore();
        }
        this.drawList(c, ctx);
    };
    return element;
}