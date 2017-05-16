/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, halfScale, defaultFont */

function SimulationGUI(width, height) {
    var gui = new GuiElement(scale * 3, scale * 3, width - scale * 6, height - scale * 6, false);

    gui.key = "";
    gui.depKeys = [];
    gui.shownKeys = [];
    gui.data = {};
    gui.refKeys = {};

    gui.diagram = new DiagramGUI(scale * 3, scale * 8, width - scale * 23, height - scale * 16);

    gui.xList = new ChangableList(gui.x + scale * 50, gui.y - scale * 1.3, 10 * scale, null, gui.key);
    gui.xList.onTextChange = function () {
        var key = gui.getKey(this.text);
        if (key !== null) {
            gui.setXUnit(key);
            gui.diagram.setUp();
        }
    };
    /*gui.yList = new ChangableList(0, gui.y - scale * 1.3, 10 * scale, null, gui.key);
     gui.yList.onTextChange = function () {
     gui.setYUnit(this.text);
     gui.diagram.setUp();
     };*/
    gui.childs = [new ExitButton(gui.width - scale * 6, scale, scale * 5), gui.xList, gui.diagram,
        new ChooseSaveChartAsFile(gui.width - scale * 48, scale, scale * 35),
        new ChooseLoadChart(gui.width - scale * 82, scale, scale * 35),
        new ChooseSaveChartAsPNG(gui.width - scale * 116, scale, scale * 35)];
    gui.setUpChildren();

    gui.closeMe = function () {
        this.xList.hideInput();
    };

    gui.getKey = function (shownKey) {
        for (var i = 0; i < this.shownKeys.length; i++) {
            if (this.shownKeys[i] === shownKey) {
                return this.depKeys[i];
            }
        }
        return null;
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = halfScale;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.font = 3 * scale + "px " + defaultFont;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText("Simulation results", this.x + scale * 1,
                this.y + scale * 4);
        ctx.font = 2 * scale + "px " + defaultFont;
        ctx.fillText("Data : Y = ", this.x + scale * 40,
                this.y + scale * 4);
        ctx.fillText("X = " + this.diagram.yKey, this.xList.x + this.xList.width + scale,
                this.y + scale * 4);
    };

    gui.setXUnit = function (xKey) {
        this.diagram.key = xKey;
        this.diagram.xUnit = (xKey.slice(-1)).toUpperCase();
        var key = this.refKeys[xKey];
        this.diagram.yKey = key;
        switch (key) {
            case "indep":
                this.diagram.yUnit = "Num";
                break;
            case "acfrequency":
                this.diagram.yUnit = "Hz";
                break;
            default:
                this.diagram.yUnit = (key.slice(-1)).toUpperCase();
                break;
        }
    };

    gui.setYUnit = function (yKey) {
        this.diagram.yKey = yKey;
        if (yKey !== "acfrequency") {
            this.diagram.yUnit = (yKey.slice(-1)).toUpperCase();
        } else {
            this.diagram.yUnit = "Hz";
        }
    };

    gui.getData = function () {
        return this.diagram !== null ? this.diagram.data : null;
    };

    gui.getChartWidth = function () {
        return this.diagram.width;
    };

    gui.getChartHeight = function () {
        return this.diagram.height;
    };

    gui.drawChartForImage = function (ctx) {
        var tmpX, tmpY;
        tmpX = this.diagram.x;
        tmpY = this.diagram.y;
        this.diagram.x = 0;
        this.diagram.y = 0;
        this.diagram.drawSimple(ctx);
        this.diagram.x = tmpX;
        this.diagram.y = tmpY;
    };

    gui.setData = function (data, simulation) {
        this.diagram.data = data[simulation.id];
        this.data = data;
        this.setDataGeneric();
    };

    gui.setDataSingle = function (data) {
        this.diagram.data = data;
        this.data = null;
        this.setDataGeneric();
    };

    gui.setDataGeneric = function () {
        this.depKeys = [];
        this.shownKeys = [];
        this.refKeys = this.diagram.data["variables"];
        for (var k in this.refKeys) {
            this.depKeys.push(k);
        }
        this.depKeys.sort();
        var tmpString;
        for (var i = 0; i < this.depKeys.length; i++) {
            tmpString = this.depKeys[i];
            if (tmpString === "acfrequency") {
                this.shownKeys.push("Source Frequency");
                continue;
            }
            if (tmpString.length >= 2) {
                switch (tmpString.slice(-2)) {
                    case ".v":
                        this.shownKeys.push("Voltage in " + tmpString.slice(0, -2));
                        break;
                    case ".i":
                        this.shownKeys.push("Current in " + tmpString.slice(0, -2));
                        break;
                    default:
                        this.shownKeys.push(tmpString.slice(0, -2));
                        break;
                }
                continue;
            }
        }
        this.setXUnit(this.depKeys[0]);
        this.xList.list = this.shownKeys;
        this.xList.text = this.shownKeys[0];
        this.xList.resizeToText();
        this.diagram.setUp();
    };

    return gui;
}

