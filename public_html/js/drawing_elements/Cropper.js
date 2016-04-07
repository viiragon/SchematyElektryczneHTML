/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global diagram, snapDistance, scale, ENABLE_CROPPING, lineWidth */

function Cropper() {
    this.x = null;
    this.y = null;
    this.ex = null;
    this.ey = null;
    this.id = 0;

    this.startEdit = function (x, y) {
        this.x = x;
        this.y = y;
        this.ex = null;
        this.ey = null;
    };

    this.setPos = function (x, y) {
        this.ex = x;
        this.ey = y;
    };

    this.getXStart = function () {
        return Math.min(this.x, this.ex);
    };

    this.getYStart = function () {
        return Math.min(this.y, this.ey);
    };

    this.getWidth = function () {
        return Math.abs(this.x - this.ex);
    };

    this.getHeight = function () {
        return Math.abs(this.y - this.ey);
    };

    this.isUsable = function () {
        return this.x !== null && this.y !== null && this.ex !== null && this.ey !== null;
    };

    this.drawMe = function (c, ctx) {
        if (this.isUsable()) {
            ctx.save();
            ctx.setLineDash([scale, scale]);
            ctx.beginPath();
            ctx.rect(this.getXStart(), this.getYStart(),
                    this.getWidth(), this.getHeight());
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = ENABLE_CROPPING ? "#7DDEFF" : "#F0F0F0";
            ctx.stroke();
            ctx.restore();
        }
    };

    this.saveMe = function () {
        if (this.isUsable()) {
            return Math.floor(this.x / scale) + ":" + Math.floor(this.y / scale) + ":"
                    + Math.floor(this.ex / scale) + ":" + Math.floor(this.ey / scale);
        } else {
            return "-";
        }
    };
}


