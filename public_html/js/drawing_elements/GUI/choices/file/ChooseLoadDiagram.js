/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont, TEXT_CHOICE */

function ChooseLoadDiagram(x, y, width) {
    var gui = new ChoiceTemplate(x, y, width, TEXT_CHOICE);
    gui.button = document.getElementById("files");
    
    gui.myMouseLeave = function (x, y) {
        gui.color = 'white';
        this.button.style.display = "none";
    };

    gui.myMouseOver = function (x, y) {
        gui.color = 'lightgray';
        this.button.style.display = "block";
        this.button.style.width = this.width + "px";
        this.button.style.height = this.height + "px";
        this.button.style.top = this.y + "px";
        this.button.style.left = this.x + "px";
    };

    gui.getValue = function () {
        return "Load file";
    };

    return gui;
}

