/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global diagram, Element, mode, MODE_DELETE, lineWidth, snapDistance, TO_RADIANS, dl, dc, scale, CON_NULL, defaultFont, halfScale */

function NetJoint(x, y, owner) {
    this.placement = CON_NULL;
    if (owner !== null && owner.netJoint === null) {
        this.joint = owner;
    } else {
        this.joint = null;
    }
    this.x = x;
    this.y = y;

    this.uniqueName = "";

    this.listGUI = new VariablesList("Node", [], [], [], this);

    this.setUniqueName = function (name) {
        this.uniqueName = name;
        this.listGUI.setUniqueName(name);
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

    this.refreshListText = function () {
        if (this.listGUI !== null) {
            this.listGUI.refreshText([]);
        }
    };

    this.setUpNetNodes = function () {
        if (this.uniqueName !== "" && this.joint !== null) {
            this.joint.spreadNodeName(this.uniqueName);
        }
    };

    this.setPos = function (x, y) {
        this.x = x;
        this.y = y;
    };

    this.isClose = function (x, y) {
        return distance(x, y, this.x, this.y) < snapDistance;
    };

    this.highlightMe = function (x, y, c, ctx) {
        if (this.isClose(x, y)) {
            if (mode !== MODE_DELETE) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3 * scale / 3, 0, 2 * Math.PI);
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = 'green';
                ctx.stroke();
            } else {
                var d = snapDistance / 2;
                ctx.beginPath();
                ctx.lineWidth = d / 2;
                ctx.moveTo(this.x - d, this.y - d);
                ctx.lineTo(this.x + d, this.y + d);
                ctx.strokeStyle = 'red';
                ctx.stroke();

                ctx.moveTo(this.x - d, this.y + d);
                ctx.lineTo(this.x + d, this.y - d);
                ctx.strokeStyle = 'red';
                ctx.stroke();
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
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2 * scale / 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = 'green';
        ctx.stroke();

        ctx.font = 2 * scale + "px " + defaultFont;
        ctx.fillStyle = "gray";
        ctx.textAlign = "left";
        var text = this.uniqueName !== "" ? this.uniqueName : "--";
        if (this.placement === CON_NULL || this.placement % 2 !== 0) {
            ctx.fillText(text, this.x + scale, this.y + halfScale);
        } else {
            ctx.fillText(text, this.x - dc.measureText(text).width / 2,
                    this.y - 2 * scale);
        }
    };

    this.saveMe = function () {
        return "n:" + Math.floor(this.x / scale) + ":" + Math.floor(this.y / scale)
                + ":" + this.uniqueName + ":" + (this.joint !== null ? this.joint.id : "-");
    };

    this.showMe = function () { //DO TESTOW
        this.highlightMe(this.x, this.y, dl, dc);
    };
}