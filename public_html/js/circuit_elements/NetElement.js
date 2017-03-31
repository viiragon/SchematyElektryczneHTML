/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global diagram, Element, scale, defaultFont */

var netNodeId = 0;

function clearNetNodesIds() {
    netNodeId = 0;
}

function getNetNodeId() {
    return netNodeId++;
}

function getIdString(begining, id) {
    var text = begining;
    while (true) {
        text += String.fromCharCode((id % 10) + 65);
        if (id === 0 || id < 10) {
            break;
        } else {
            id = Math.floor(id / 10);
        }
    }
    return text;
}

function NetElement(netName, owner) {
    this.element = owner;

    this.netName = netName;
    this.uniqueName = "";
    this.showName = true;
    this.netNodes = [];
    this.netNodesOrder = [];
    this.netParametersIDs = [];
    this.netParametersValues = [];
    this.netParametersNames = [];
    this.netParametersLists = [];
    this.netParametersVisibility = [];

    this.listGUI = null;

    this.setUpList = function () {
        this.listGUI = new VariablesList(this.element.name
                , this.netParametersNames
                , this.netParametersValues
                , this.netParametersLists, this);
    };

    this.addList = function () {
        if (this.listGUI !== null) {
            diagram.addElement(this.listGUI);
        }
    };

    this.deleteList = function () {
        if (this.listGUI !== null) {
            diagram.deleteElement(this.listGUI);
        }
    };

    this.isListOpen = function () {
        if (this.listGUI !== null) {
            return this.listGUI.visible;
        }
        return false;
    };

    this.showList = function (x, y) {
        if (this.listGUI !== null) {
            this.listGUI.setPos(x, y);
            this.listGUI.visible = true;
        }
    };

    this.hideList = function () {
        if (this.listGUI !== null) {
            this.listGUI.visible = false;
            this.listGUI.hideInput();
        }
    };

    this.setUpNodes = function (nodeCount) {
        for (var i = 0; i < nodeCount; i++) {
            this.netNodes.push(null);
            this.netNodesOrder.push(i);
        }
    };

    this.clearData = function () {
        for (var i = 0; i < this.netNodes.length; i++) {
            this.netNodes[i] = null;
        }
    };

    this.rotate = function () {
        var tmp;
        for (var i = 0; i < this.netNodesOrder.length; i++) {
            tmp = this.netNodesOrder[i];
            this.netNodesOrder[i] = this.netNodesOrder[i + 1];
            this.netNodesOrder[i + 1] = tmp;
        }
    };

    this.getNetElementString = function () {
        var ownerText;
        if (this.owner instanceof Element) {
            ownerText = "e";
        } else {
            ownerText = "s";
        }
        var name = this.uniqueName === "" ? getIdString(ownerText, this.element.id) : this.uniqueName;
        var text = this.netName + ":" + name;
        for (var i = 0; i < this.netNodesOrder.length; i++) {
            if (this.netNodes[this.netNodesOrder[i]] !== null) {
                text += " " + this.netNodes[this.netNodesOrder[i]].nodeId;
            }
        }
        for (var i = 0; i < this.netParametersIDs.length; i++) {
            text += " " + this.netParametersIDs[i] + "=\"" + this.netParametersValues[i] + "\"";
        }
        return text;
    };

    this.refreshListText = function () {
        if (this.listGUI !== null) {
            this.listGUI.refreshText(this.netParametersValues);
        }
    };

    this.drawName = function (x, y, c, ctx) {
        if (this.uniqueName !== "") {
            ctx.font = 2 * scale + "px " + defaultFont;
            ctx.fillStyle = "gray";
            ctx.textAlign = "left";
            if (this.showName) {
                ctx.fillText(this.uniqueName, x, y);
            }
        }
    };

    this.drawParametersList = function (x, y, c, ctx) {
        ctx.font = 2 * scale + "px " + defaultFont;
        ctx.fillStyle = "gray";
        ctx.textAlign = "left";
        var d = 0;
        for (var i = 0; i < this.netParametersIDs.length; i++) {
            if (this.netParametersVisibility[i]) {
                ctx.fillText(this.netParametersIDs[i] + ": " + this.netParametersValues[i],
                        x, y + 2.5 * scale * d);
                d++;
            }
        }
    };

    this.saveMe = function () {
        var values = this.uniqueName + "|";
        var tmp;
        for (var i = 0; i < this.netParametersValues.length; i++) {
            tmp = this.netParametersValues[i];
            tmp = tmp.replace(/(?:\r\n|\r|\n| |\t)/g, '_');  //Usuwa białe znaki            
            values += tmp + "|";
        }
        values += (this.showName ? "1" : "0") + "|";
        for (var i = 0; i < this.netParametersVisibility.length; i++) {
            values += this.netParametersVisibility[i] ? "1" : "0";
            if (i !== this.netParametersVisibility.length - 1) {
                values += "|";
            }
        }
        return values;
    };
}
