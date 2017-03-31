/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, defaultFont, halfScale, dc */

function ChangableName(x, y, minimalWidth, text) {
    var gui;
    gui = new ChangableText(x, y, minimalWidth, text);

    gui.onTextLostFocus = function () {
        this.hideInput();
        var tmpText = this.input.value;
        if (tmpText !== "") {
            if (this.checkText(tmpText)) {
                if (!existsInNameTable(tmpText)) {
                    if (existsInNameTable(this.text)) {
                        removeFromNameTable(this.text);
                    }
                    addToNameTable(tmpText);
                    this.text = tmpText;
                    this.resizeToText();
                    this.onTextChange();
                } else {
                    this.showInput(true, tmpText);
                }
            } else {
                this.showInput(true, tmpText);
            }
        }
        refreshDrawingLayer();
    };

    gui.checkText = function (text) {
        return text.match(/^\w+$/g);
    };

    return gui;
}

