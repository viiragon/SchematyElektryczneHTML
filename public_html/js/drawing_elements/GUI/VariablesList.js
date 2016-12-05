/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, halfScale, defaultFont, dc */

function VariablesList(name, names, values, netElement) {
    var gui = new GuiElement(0, 0, 0, 0, false);
    gui.name = name;
    gui.names = names;
    gui.netElement = netElement;
    gui.alwaysVisible = true;
    gui.nameOffset = 0;
    var tmp;
    dc.font = 2 * scale + "px " + defaultFont;
    for (var i = 0; i < gui.names.length; i++) {
        tmp = dc.measureText(gui.names[i]).width;
        if (tmp > gui.nameOffset) {
            gui.nameOffset = tmp;
        }
    }
    for (var i = 0; i < values.length; i++) {
        var text = new ChangableText(gui.nameOffset + 4 * scale, 4.75 * scale + i * 4 * scale, 10 * scale, values[i]);
        text.valueId = i;
        text.onTextChange = function () {
            values[this.valueId] = this.text;
            gui.refreshWidth();
        };
        gui.childs.push(text);
    }
    gui.setUpChildren();

    gui.hideInput = function () {
        this.childs[0].hideInput();
    };

    gui.refreshText = function (values) {
        for (var i = 0; i < values.length; i++) {
            this.childs[i].text = values[i];
        }
    };

    gui.refreshWidth = function () {
        dc.font = 2 * scale + "px " + defaultFont;
        var maxWidth = dc.measureText(this.name).width + 4 * scale;
        var maxHeight = 0;
        var tmp;
        for (var i = 0; i < this.childs.length; i++) {
            var child = this.childs[i];
            tmp = child.ix + child.width + 2 * scale;
            if (tmp > maxWidth) {
                maxWidth = tmp;
            }
            tmp = child.iy + child.height + 2 * scale;
            if (tmp > maxHeight) {
                maxHeight = tmp;
            }
        }
        this.width = maxWidth;
        this.height = maxHeight;
    };
    gui.refreshWidth();

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
        for (var i = 0; i < this.names.length; i++) {
            ctx.fillText(this.names[i] + ":", this.x + 2 * scale,
                    this.y + 7 * scale + 4 * scale * i);
        }
    };

    return gui;
}
