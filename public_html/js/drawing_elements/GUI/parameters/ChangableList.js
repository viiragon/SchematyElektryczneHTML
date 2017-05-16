/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, defaultFont, halfScale, dc */

function ChangableList(x, y, minimalWidth, list, text) {
    var gui;
    dc.font = 2 * scale + "px " + defaultFont;
    gui = new GuiElement(x, y, minimalWidth, scale * 3, true);
    gui.color = 'white';
    gui.list = list;
    gui.text = text;
    gui.input = document.getElementById("list");
    gui.input.owner = null;
    gui.minimalWidth = minimalWidth;

    gui.hideInput = function () {
        this.input = document.getElementById("list");
        this.input.style.display = "none";
        this.input.style.top = "0px";
        this.input.style.left = "0px";
        this.input.onblur = null;
        this.input.onkeypress = null;
        ENABLE_KEYBOARD = true;
        this.input.owner = null;
    };

    gui.onTextLostFocus = function () {
        this.hideInput();
        this.text = this.input.options[this.input.selectedIndex].value;
        this.onTextChange();
        refreshDrawingLayer();
    };

    gui.showInput = function (text) {
        if (this.input.owner !== this) {
            if (this.input.owner !== null) {
                this.input.owner.onTextLostFocus();
            }
            this.input.style.display = "block";
            this.input.style.width = this.width + "px";
            this.input.style.height = this.height + "px";
            this.input.style.top = this.y + "px";
            this.input.style.left = this.x + "px";
            this.input.style.fontSize = 2 * scale + "px";
            this.input.value = text;
            this.input.onblur = function () {
                this.owner.onTextLostFocus();
            };
            this.clearInput();
            this.fillInputAndSelect(text);
            this.input.owner = this;
            this.input.onkeypress = function (evt) {
                var code = (evt.keyCode ? evt.keyCode : evt.which);
                if (code === 13) { //Enter keycode                        
                    evt.preventDefault();
                    this.owner.onTextLostFocus();
                } else if (code === 27) {   //ESC
                    evt.preventDefault();
                    this.owner.hideInput();
                }
            };
            this.input.onselect = function (evt) {
                evt.preventDefault();
                this.owner.onTextLostFocus();
            };
            ENABLE_KEYBOARD = false;
        }
    };

    gui.fillInputAndSelect = function (selected) {
        for (var i = 0; i < this.list.length; i++) {
            var optn = document.createElement("OPTION");
            optn.text = this.list[i];
            optn.value = this.list[i];
            this.input.options.add(optn);
        }
        this.input.value = selected;
        this.text = selected;
    };

    gui.selectOption = function (selected) {
        this.input.value = selected;
        this.text = selected;
    };

    gui.clearInput = function () {
        for (var i = this.input.options.length - 1; i >= 0; i--) {
            this.input.remove(i);
        }
    };

    gui.onTextChange = function () {
    };

    gui.myClick = function (x, y) {
        this.showInput(this.text);
    };

    gui.resizeToText = function () {
        dc.font = 2 * scale + "px " + defaultFont;
        var newWidth = this.minimalWidth;
        var tmp;
        for (var i = 0; i < this.list.length; i++) {
            tmp = dc.measureText(this.list[i]).width + 2 * scale;
            if (tmp > newWidth) {
                newWidth = tmp;
            }
        }
        this.width = newWidth;
    };

    gui.myMouseOver = function (x, y) {
        this.color = 'lightgray';
    };

    gui.myMouseLeave = function (x, y) {
        this.color = 'white';
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.font = 2 * scale + "px " + defaultFont;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText(this.text, this.x + scale,
                this.y + this.height / 1.3);
    };

    if (gui.list !== null) {
        gui.resizeToText();
    }
    return gui;
}

