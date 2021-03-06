/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, defaultFont, dc, elementChoosers, diagram, lineWidth, halfScale */

function singleElement(name, child, action) {
    return {
        name: name
        , child: child
        , action: action
    };
}

function ListGUI(list, affected) {
    var gui = new GuiElement(-4 * scale, 0, 0, 0, false);

    gui.largerWidth = true;
    gui.childs = [];
    gui.nameList = [];
    gui.actions = [];
    gui.images = [];
    gui.highlight = false;
    gui.highlighted = 0;
    gui.affected = affected;
    gui.fontSize = 3 * scale;
    gui.lineHeight = gui.fontSize * 2;

    dc.font = gui.fontSize + "px " + defaultFont;
    var intTmp;
    for (var i = 0; i < list.length; i++) {
        gui.childs.push(list[i].child);
        if (list[i].child !== null) {
            list[i].child.iy += i * gui.lineHeight;
            list[i].child.affected = affected;
        }
        gui.nameList.push(list[i].name);
        gui.actions.push(list[i].action);
        gui.images.push(getImage(list[i].action));
        intTmp = dc.measureText(list[i].name).width;
        if (gui.width < intTmp) {
            gui.width = intTmp;
        }
    }
    gui.width += 4 * scale;
    gui.height = gui.nameList.length * gui.lineHeight;
    gui.ix = -gui.width + 3 * scale;

    gui.isClose = function (x, y) {
        if (this.largerWidth) {
            if (x <= this.x + this.width - 1 * scale) {
                this.largerWidth = false;
            }
            return x >= this.x && x <= this.x + this.width + 11 * scale
                    && y >= this.y && y <= this.y + this.height;
        } else {
            return x >= this.x && x <= this.x + this.width
                    && y >= this.y && y <= this.y + this.height;
        }
    };

    gui.myClick = function (x, y) {
        var num = Math.floor((y - this.y) / this.lineHeight);
        if (this.actions[num] !== null) {
            this.affected.setElement(this.actions[num]);
        }
    };

    gui.correctPosition = function () {
        if (this.y + this.height > diagram.windowHeight) {
            this.iy -= Math.ceil((this.y + this.height - diagram.windowHeight) / this.lineHeight) * this.lineHeight;
            this.refreshPlacement();
        }
    };

    gui.myMouseOver = function (x, y) {
        this.highlight = true;
        var num = Math.floor((y - this.y) / this.lineHeight);
        this.highlighted = num;
        this.affected.setTmpElement(this.images[num]);
        this.correctPosition();
        if (this.childs[num] !== null) {
            this.childs[num].visible = true;
            this.childs[num].correctPosition();
        }
        for (var i = 0; i < elementChoosers.length; i++) {
            if (elementChoosers[i] !== this.affected) {
                elementChoosers[i].childs[0].visible = false;
            }
        }
    };

    gui.myMouseLeave = function (x, y) {
        this.highlight = false;
        for (var i = 0; i < elementChoosers.length; i++) {
            elementChoosers[i].childs[0].visible = true;
        }
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.lineWidth = halfScale;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.font = this.fontSize + "px " + defaultFont;
        ctx.textAlign = "center";
        for (var i = 0; i < this.nameList.length; i++) {
            if (this.affected.element === this.actions[i]) {
                ctx.beginPath();
                ctx.rect(this.x + lineWidth * 2, this.y + i * this.lineHeight + lineWidth * 2,
                        this.width - halfScale * 2, this.lineHeight - halfScale * 2);
                ctx.fillStyle = "gray";
                ctx.fill();
                ctx.fillStyle = "white";
            } else if (this.highlight && i === this.highlighted) {
                ctx.beginPath();
                ctx.rect(this.x + lineWidth, this.y + i * this.lineHeight + lineWidth,
                        this.width - halfScale, this.lineHeight - halfScale);
                ctx.fillStyle = "lightgray";
                ctx.fill();
                ctx.fillStyle = "black";
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fillText(this.nameList[i], this.x + this.width / 2,
                    this.y + i * this.lineHeight + this.fontSize * 1.3);
        }
    };

    return gui;
}

function listCreator(affected) {
    var switches = new ListGUI([
        singleElement("SPST Toggle Switch", null, "spstToggle"),
        singleElement("SPDT Toggle Switch", null, "spdtToggle"),
        singleElement("Pushbutton Switch (N.O)", null, "buttonSwitchNO"),
        singleElement("Pushbutton Switch (N.C)", null, "buttonSwitchNC")
    ]);
    var grounds = new ListGUI([
        singleElement("Earth Ground", null, "earthGround"),
        singleElement("Chassis Ground", null, "chassisGround")
    ]);
    var resistors = new ListGUI([
        singleElement("Resistor (IEEE)", null, "resistorIEEE"),
        singleElement("Resistor (IEC)", null, "resistorIEC"),
        singleElement("Potentiometer (IEEE)", null, "potentiometrIEEE"),
        singleElement("Potentiometer (IEC)", null, "potentiometrIEC"),
        singleElement("Variable Resistor (IEEE)", null, "varResistorIEEE"),
        singleElement("Variable Resistor (IEC)", null, "varResistorIEC"),
        singleElement("Trimmer Resistor", null, "trimResistor"),
        singleElement("Thermistor", null, "thermistor")
    ]);
    var capacitors = new ListGUI([
        singleElement("Capacitor", null, "capacitor"),
        singleElement("Polarized Capacitor", null, "polCapacitor"),
        singleElement("Variable Capacitor", null, "varCapacitor")
    ]);
    var inductors = new ListGUI([
        singleElement("Inductor", null, "inductor"),
        singleElement("Core Inductor", null, "coreInductor"),
        singleElement("Variable Inductor", null, "varInductor")
    ]);
    var power = new ListGUI([
        singleElement("Voltage Source", null, "volSource"),
        singleElement("Current Source", null, "currSource"),
        singleElement("AC Voltage Source", null, "ACVolSource"),
        singleElement("Generator", null, "generator"),
        singleElement("Battery Cell", null, "cell"),
        singleElement("Controlled Voltage Source", null, "contrVolSource"),
        singleElement("Controlled Current Source", null, "contrCurrSource")
    ]);
    var meters = new ListGUI([
        singleElement("Voltmeter", null, "voltmeter"),
        singleElement("Ammeter", null, "ammeter"),
        singleElement("Ohmmeter", null, "ohmmeter"),
        singleElement("Wattmeter", null, "wattmeter")
    ]);
    var diodes = new ListGUI([
        singleElement("Diode", null, "diode"),
        singleElement("Zener Diode", null, "zenDiode"),
        singleElement("Schottky Diode", null, "schDiode"),
        singleElement("Varicap Diode", null, "variDiode"),
        singleElement("Tunnel Diode", null, "tunnelDiode"),
        singleElement("Light Emitting Diode (LED)", null, "led"),
        singleElement("Photodiode", null, "photodiode")
    ]);
    var transistors = new ListGUI([
        singleElement("NPN Bipolar Transistor", null, "npn"),
        singleElement("PNP Bipolar Transistor", null, "pnp"),
        singleElement("JFET-N Transistor", null, "jfetn"),
        singleElement("JFET-P Transistor", null, "jfetp"),
        singleElement("NMOS Transistor", null, "nmos"),
        singleElement("PMOS Transistor", null, "pmos")
    ]);
    var misc = new ListGUI([
        singleElement("Motor", null, "motor"),
        singleElement("Transformer", null, "transformer"),
        singleElement("Lamp", null, "lamp"),
        singleElement("Fuse", null, "fuse"),
        singleElement("Operational Amplifier", null, "amplifier")
    ]);
    var simulations = new ListGUI([
        singleElement("AC Simulation", null, "acSimulation"),
        singleElement("DC Simulation", null, "dcSimulation")
    ]);
    var root = new ListGUI([
        singleElement("Switches", switches, null),
        singleElement("Grounds", grounds, null),
        singleElement("Resistors", resistors, null),
        singleElement("Capacitors", capacitors, null),
        singleElement("Inductors", inductors, null),
        singleElement("Power Supply", power, null),
        singleElement("Meters", meters, null),
        singleElement("Diodes", diodes, null),
        singleElement("Transistors", transistors, null),
        singleElement("Miscellaneous", misc, null),
        singleElement("Simulations", simulations, null)
    ], affected);
    return root;
}

