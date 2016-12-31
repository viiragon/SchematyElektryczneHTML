/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global diagram, scale, snapDistance, mode, MODE_DELETE, lineWidth, dl, dc, NULL_NODE */

function DCSimulation(x, y, name) {
    var sim = new Simulation(x, y, name);

    var net = sim.getNetElement();
    net.netName = ".DC";
    net.netParametersIDs = ["Temp"];
    net.netParametersValues = ["26.85"];
    net.netParametersNames = ["Temperature"];
    net.setUpList();
    
    return sim;
}

function ACSimulation(x, y, name) {
    var sim = new Simulation(x, y, name);

    var net = sim.getNetElement();
    net.netName = ".AC";
    net.netParametersIDs = ["Start", "Stop", "Points", "Type"];
    net.netParametersValues = ["1 Hz", "10 MHz", "100", "log"];
    net.netParametersNames = ["Starting frequency", "Ending frequency", "Num. of simulation steps", "Sweep type"];
    net.netParametersLists = [3, ["log", "lin", "list", "const"]];
    net.setUpList();
    
    return sim;
}

function Simulation(x, y, name) {
    this.width = 6 * scale;
    this.x = x;
    this.y = y;
    this.id = -2;
    this.placed = false;
    this.name = name;
    this.image = getImage(name);

    this.netElement = new NetElement("R", this);

    this.getNetElement = function () {
        return this.netElement;
    };

    this.showList = function () {
        this.netElement.showList(this.x + diagram.xoffset, this.y + diagram.yoffset);
    };

    this.hideList = function () {
        this.netElement.hideList();
    };

    this.setPos = function (x, y) {
        this.x = x;
        this.y = y;
    };

    this.isClose = function (x, y) {
        return distance(x, y, this.x, this.y) < this.width / 2;
    };

    this.highlightMe = function (x, y, c, ctx) {
        if (this.isClose(x, y)) {
            if (mode !== MODE_DELETE) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width / 2.5, 0, 2 * Math.PI);
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            } else {
                var d = this.width / 3;
                ctx.lineWidth = snapDistance / 3;
                ctx.moveTo(this.x - d, this.y - d);
                ctx.lineTo(this.x + d, this.y + d);
                ctx.strokeStyle = 'red';
                ctx.stroke();

                ctx.moveTo(this.x - d, this.y + d);
                ctx.lineTo(this.x + d, this.y - d);
                ctx.strokeStyle = 'red';
                ctx.stroke();
                ctx.lineWidth = 1;
            }
            return true;
        }
        return false;
    };

    this.deleteMe = function (x, y) {
        if (this.isClose(x, y)) {
            diagram.deleteElement(this);
            return true;
        }
        return false;
    };

    this.drawMe = function (c, ctx) {
        if (this.image !== null) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
            ctx.restore();
        }
    };

    this.saveMe = function () {
        return "s:" + this.id + ":" + this.name + ":" + Math.floor(this.x / scale) + ":" + Math.floor(this.y / scale) + ":" + this.netElement.saveMe();
    };

    this.showMe = function () { //DO TESTOW
        this.highlightMe(this.x, this.y, dl, dc);
    };
}


