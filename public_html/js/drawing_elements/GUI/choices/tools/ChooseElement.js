/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, MODE_NORMAL, snapDistance, defaultFont, BIG_CHOICE, halfScale */

function ChooseElement(x, y) {
    var gui = new ChoiceTemplate(x, y, 10 * scale, BIG_CHOICE);
    gui.element = "";
    gui.image = null;
    gui.tmpImage = null;

    gui.childs = [new ListAppearer(gui)];

    gui.myClick = function (x, y) {
        placingId = 1;
        mode = MODE_NORMAL;
        placingElement = this;
    };

    gui.myRightClick = function (x, y) {
        this.childs[0].showList();
    };

    gui.setElement = function (name) {
        this.element = name;
        this.image = getImage(name);
    };

    gui.setTmpElement = function (image) {
        this.tmpImage = image;
    };

    gui.getElement = function (x, y) {
        if (this.element !== "") {
            var ret = getElementFromName(this.element, x, y);
            return ret;
        }
        return null;
    };

    gui.drawOnlyMe = function (c, ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = halfScale;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        if (this.image !== null || this.tmpImage !== null) {
            if (this.tmpImage === null || this.tmpImage === this.image) {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
            else {
                ctx.globalAlpha = 0.6;
                ctx.drawImage(this.tmpImage, this.x, this.y, this.width, this.height);
                this.tmpImage = null;
            }
        }
        ctx.globalAlpha = 1;

        if (mode === MODE_NORMAL && placingId === 1 && placingElement === this) {
            ctx.beginPath();
            ctx.rect(this.x + scale, this.y + scale, this.width - 2 * scale, this.height - 2 * scale);
            ctx.lineWidth = halfScale;
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
    };

    return gui;
}

