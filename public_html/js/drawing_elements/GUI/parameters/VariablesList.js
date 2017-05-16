/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, halfScale, defaultFont, dc, ChangableText, ChangableList, diagram */

function getListFromId(list, index) {
    for (var i = 0; i < list.length; i += 2) {
        if (list[i] === index) {
            return list[i + 1];
        }
    }
    return null;
}

var LIST_ELEMENT_TEXT = 0, LIST_ELEMENT_LIST = 1, LIST_ELEMENT_NAME = 2, LIST_ELEMENT_VISIBILITY = 3;

function VariablesList(name, names, values, lists, netElement) {
    var gui = new GuiElement(0, 0, 0, 0, false);
    gui.name = name;
    gui.names = names;
    gui.netElement = netElement;
    gui.alwaysVisible = true;
    gui.nameOffset = dc.measureText("Name").width;
    var tmp;
    dc.font = 2 * scale + "px " + defaultFont;
    for (var i = 0; i < gui.names.length; i++) {
        tmp = dc.measureText(gui.names[i]).width;
        if (tmp > gui.nameOffset) {
            gui.nameOffset = tmp;
        }
    }
    var element;
    //NAME ELEMENT
    gui.nameElement = new ChangableName(gui.nameOffset + 4 * scale, 4.75 * scale, 15 * scale, netElement.uniqueName);
    gui.nameElement.valueId = -1;
    gui.nameElement.type = LIST_ELEMENT_NAME;
    gui.nameElement.onTextChange = function () {
        netElement.uniqueName = this.text;
        gui.refreshWidth();
    };
    gui.childs.push(gui.nameElement);

    element = new VisibilityButton(gui.nameOffset + 15 * scale, 5.25 * scale);
    element.type = LIST_ELEMENT_VISIBILITY;
    element.getCondition = function () {
        return netElement.showName;
    };
    element.myClick = function (x, y) {
        netElement.showName = !netElement.showName;
    };
    gui.childs.push(element);

    //OTHER ELEMENTS
    for (var i = 0; i < values.length; i++) {
        var list = getListFromId(lists, i);
        if (list !== null) {
            element = new ChangableList(gui.nameOffset + 4 * scale, 4.75 * scale + (i + 1) * 4 * scale, 10 * scale
                    , list, values[i]);
            element.valueId = i;
            element.type = LIST_ELEMENT_LIST;
            element.onTextChange = function () {
                values[this.valueId] = this.text;
            };
        } else {
            element = new ChangableText(gui.nameOffset + 4 * scale, 4.75 * scale + (i + 1) * 4 * scale, 15 * scale, values[i]);
            element.valueId = i;
            element.type = LIST_ELEMENT_TEXT;
            element.onTextChange = function () {
                values[this.valueId] = this.text;
                gui.refreshWidth();
            };
        }
        gui.childs.push(element);

        element = new VisibilityButton(gui.nameOffset + 15 * scale, 5.25 * scale + (i + 1) * 4 * scale);
        element.valueId = i;
        element.type = LIST_ELEMENT_VISIBILITY;
        element.getCondition = function () {
            return netElement.netParametersVisibility[this.valueId];
        };
        element.myClick = function (x, y) {
            netElement.netParametersVisibility[this.valueId] = !netElement.netParametersVisibility[this.valueId];
        };
        gui.childs.push(element);
    }
    gui.setUpChildren();

    gui.hideInput = function () {
        this.childs[0].hideInput();
    };

    gui.setUniqueName = function (name) {
        this.nameElement.text = name;
    };

    gui.refreshText = function (values) {
        for (var i = 0; i < this.childs.length; i++) {
            switch (this.childs[i].type) {
                case LIST_ELEMENT_NAME:
                    this.childs[i].text = this.netElement.uniqueName;
                    break;
                case LIST_ELEMENT_TEXT:
                    this.childs[i].text = values[this.childs[i].valueId];
                    break;
                case LIST_ELEMENT_LIST:
                    this.childs[i].selectOption(values[this.childs[i].valueId]);
                    break;
            }
        }
    };

    gui.refreshWidth = function () {
        dc.font = 2 * scale + "px " + defaultFont;
        var maxWidth = dc.measureText(this.name).width + 4 * scale;
        var maxHeight = 0;
        var tmp;
        for (var i = 0; i < this.childs.length; i++) {
            var child = this.childs[i];
            if (child.type !== LIST_ELEMENT_VISIBILITY) {
                tmp = child.ix + child.width + 2 * scale;
                if (tmp > maxWidth) {
                    maxWidth = tmp;
                }
                tmp = child.iy + child.height + 2 * scale;
                if (tmp > maxHeight) {
                    maxHeight = tmp;
                }
            }
        }
        for (var i = 0; i < this.childs.length; i++) {
            var child = this.childs[i];
            if (child.type === LIST_ELEMENT_VISIBILITY) {
                child.ix = maxWidth;
            }
        }
        this.width = maxWidth + 4 * scale;
        this.height = maxHeight;
    };
    gui.refreshWidth();

    gui.setPos = function (x, y) {
        x = Math.min(diagram.windowWidth - 14 * scale - this.width, x);
        y = Math.min(diagram.windowHeight - this.height, y);
        this.x = this.ix = x;
        this.y = this.iy = y;
        this.setUpChildren();
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = halfScale;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.font = 2 * scale + "px " + defaultFont;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText(this.name, this.x + 2 * scale,
                this.y + 3 * scale);
        ctx.fillText("Name:", this.x + 2 * scale, this.y + 7 * scale);
        for (var i = 0; i < this.names.length; i++) {
            ctx.fillText(this.names[i] + ":", this.x + 2 * scale,
                    this.y + 7 * scale + 4 * scale * (i + 1));
        }
    };

    return gui;
}

