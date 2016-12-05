/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, defaultFont, halfScale, dc */

function ChangableText(x, y, minimalWidth, text) {
    var gui;
    gui = new GuiElement(x, y, scale, scale * 3, true);
    gui.color = 'white';
    gui.text = text;
    gui.input = document.getElementById("text");
    gui.input.owner = null;
    gui.minimalWidth = minimalWidth;

    //REGEX : ^[0-9]+([.][0-9]+){0,1}( (a|f|p|n|u|m|k|M|G|T){0,1}(W|A|V|Hz|F|H|K|S|s|Ohm)){0,1}$

    gui.onTextLostFocus = function () {
        this.hideInput();
        if (this.checkText(this.input.value)) {
            this.text = this.input.value;
            this.resizeToText();
            this.onTextChange();
        } else {
            this.showInput(true, this.input.value);
        }
        refreshDrawingLayer();
    };

    gui.checkText = function (text) {
        return text.match(/^[0-9]+([.][0-9]+){0,1}( (a|f|p|n|u|m|k|M|G|T){0,1}(W|A|V|Hz|F|H|K|S|s|Ohm)){0,1}$/g);
    };

    gui.hideInput = function () {
        this.input = document.getElementById("text");
        this.input.style.display = "none";
        this.input.style.top = "0px";
        this.input.style.left = "0px";
        this.input.onblur = null;
        this.input.onkeypress = null;
        ENABLE_KEYBOARD = true;
        this.input.owner = null;
    };

    gui.showInput = function (error, text) {
        if (this.input.owner !== this) {
            if (this.input.owner !== null) {
                this.input.owner.onTextLostFocus();
            }
            this.input.style.display = "block";
            this.input.style.width = this.width / 1.1 + "px";
            this.input.style.height = this.height / 1.3 + "px";
            this.input.style.top = this.y + "px";
            this.input.style.left = this.x + "px";
            if (error) {
                this.input.style.backgroundColor = "tomato";
                this.input.title = "Not valid unit format (number + unit)";
            } else {
                this.input.style.backgroundColor = "white";
                this.input.title = "";
            }
            this.input.value = text;
            this.input.onblur = this.onTextLostFocus;
            this.input.onkeypress = function (evt) {
                var code = (evt.keyCode ? evt.keyCode : evt.which);
                if (code === 13) { //Enter keycode                        
                    evt.preventDefault();
                    gui.onTextLostFocus();
                } else if (code === 27) {   //ESC
                    evt.preventDefault();
                    gui.hideInput();
                }
            };
            this.input.owner = this;
            ENABLE_KEYBOARD = false;
        }
    };

    gui.onTextChange = function () {
    };

    gui.myClick = function (x, y) {
        this.showInput(false, this.text);
    };

    gui.resizeToText = function () {
        dc.font = 2 * scale + "px " + defaultFont;
        var tmp = dc.measureText(this.text).width + 1 * scale;
        if (tmp < this.minimalWidth) {
            tmp = this.minimalWidth;
        }
        this.width = tmp;
    };
    gui.resizeToText();

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
        ctx.textAlign = "center";
        ctx.fillText(this.text, this.x + this.width / 2,
                this.y + this.height / 1.3);
    };

    return gui;
}

