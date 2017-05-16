/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global scale, halfScale, defaultFont, lineWidth, Infinity */

function DiagramGUI(x, y, width, height) {
    var gui = new GuiElement(x, y, width, height, true);

    gui.key = "";
    gui.yKey = "";
    gui.xUnit = "";
    gui.yUnit = "";
    //gui.childs = [];
    //gui.setUpChildren();
    gui.data = null;
    gui.isLog = true;
    gui.isIndep = false;

    gui.points = null;
    gui.indep = null;
    gui.startX = 11 * scale;
    gui.startY = 9 * scale;
    gui.min = 0;
    gui.max = 0;
    gui.minScale = 0;
    gui.maxScale = 0;
    gui.heightScale = 1;
    gui.endScale = 1;

    gui.chartWidth = 1;
    gui.chartHeight = 1;

    gui.lastMx = 0;
    gui.lastMy = 0;

    gui.setUp = function () {
        if (this.data !== null) {
            this.isLog = true;
            this.isIndep = this.yKey === "indep";
            this.min = Number.MAX_VALUE;
            this.max = Number.MIN_VALUE;
            this.minScale = Number.MAX_VALUE;
            this.maxScale = Number.MIN_VALUE;
            this.points = this.data[this.key];
            if (!this.isIndep) {
                this.indep = this.data[this.yKey];
            }
            for (var i = 0; i < this.points.length; i++) {
                if (this.points[i] > this.max) {
                    this.max = this.points[i];
                }
                if (this.points[i] < this.min) {
                    this.min = this.points[i];
                }
                if (!this.isIndep) {
                    if (this.indep[i] > this.maxScale) {
                        this.maxScale = this.indep[i];
                    }
                    if (this.indep[i] < this.minScale) {
                        this.minScale = this.indep[i];
                    }
                }
            }
            if (this.min > 0) {
                this.min = 0;
            }
            if (this.max < 0) {
                this.max = 0;
            }
            this.chartWidth = this.width - this.startX * 2;
            this.chartHeight = this.height - this.startY * 2;
            if (Math.abs(this.max - this.min) <= 0.001) {
                this.max = 1;
            }
            this.heightScale = this.chartHeight / (this.max - this.min);
            if (!this.isIndep) {
                this.endScale = this.chartWidth / (this.getY(this.maxScale) - this.getY(this.minScale));
            } else {
                this.endScale = this.chartWidth / this.points.length;
                this.minScale = 0;
                this.maxScale = this.chartHeight;
                this.isLog = false;
            }
        }
    };

    gui.drawOnlyMe = function (c, ctx) {
        if (this.data !== null) {
            this.drawSimple(ctx);
            this.drawOnMouseValue(ctx);
        }
    };

    gui.drawSimple = function (ctx) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "black";

        var repeater = Math.min(this.getY(this.minScale) * this.endScale, 0);

        this.drawLine(ctx, this.startX - repeater, (this.height - this.startY) + 3 * scale,
                this.startX - repeater, this.startY - 7.1 * scale);

        this.drawLine(ctx, this.startX - repeater, this.startY - 7 * scale,
                this.startX - repeater - 2 * scale, this.startY - 5 * scale);

        this.drawLine(ctx, this.startX - repeater, this.startY - 7 * scale,
                this.startX - repeater + 2 * scale, this.startY - 5 * scale);


        ctx.font = 2 * scale + "px " + defaultFont;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText(this.xUnit, this.x + this.startX - repeater + 3 * scale,
                this.y + this.startY - 5 * scale);

        var tmpi = 0;
        var tmpa = 0;
        ctx.textAlign = "right";
        for (var i = 0; i <= 10; i++) {
            tmpi = (this.height - this.startY) - i * this.chartHeight / 10.0;
            tmpa = this.min + i * (this.max - this.min) / 10;
            if (tmpa !== 0) {
                this.drawLine(ctx, this.startX - repeater - scale, tmpi,
                        this.startX - repeater + scale, tmpi);
                ctx.fillText(this.getShortNumber(tmpa), this.x + this.startX - repeater - scale, this.y + tmpi + scale);
            }
        }

        repeater = (this.height - this.startY) + Math.min(this.min * this.heightScale, 0);

        this.drawLine(ctx, this.startX - scale, repeater,
                this.startX + this.chartWidth + 7.1 * scale, repeater);

        this.drawLine(ctx, this.startX + this.chartWidth + 7 * scale, repeater,
                this.startX + this.chartWidth + 5 * scale, repeater - 2 * scale);

        this.drawLine(ctx, this.startX + this.chartWidth + 7 * scale, repeater,
                this.startX + this.chartWidth + 5 * scale, repeater + 2 * scale);

        ctx.textAlign = "left";
        ctx.fillText(this.yUnit, this.x + this.startX + this.chartWidth + 5 * scale,
                this.y + repeater + 4 * scale);

        ctx.textAlign = "center";
        for (var i = 0; i <= 10; i++) {
            tmpi = this.startX + i * this.chartWidth / 10.0;
            if (!this.isIndep) {
                tmpa = this.getY(this.minScale) + i * (this.getY(this.maxScale) - this.getY(this.minScale)) / 10;
            } else {
                tmpa = i * this.points.length / 10.0;
            }
            if (tmpa !== 0) {
                this.drawLine(ctx, tmpi, repeater - scale,
                        tmpi, repeater + scale);
                ctx.fillText(this.getShortNumber(this.getValue(tmpa)), this.x + tmpi, this.y + repeater - scale);
            }
        }

        ctx.textAlign = "left";
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
        for (var i = 1; i < this.points.length; i++) {
            if (!this.isIndep) {
                this.drawLine(ctx,
                        this.startX + (this.getY(this.indep[i - 1]) - this.getY(this.minScale)) * this.endScale,
                        (this.height - this.startY) - (this.points[i - 1] - this.min) * this.heightScale,
                        this.startX + (this.getY(this.indep[i]) - this.getY(this.minScale)) * this.endScale,
                        (this.height - this.startY) - (this.points[i] - this.min) * this.heightScale);

                ctx.beginPath();
                ctx.arc(this.x + this.startX + (this.getY(this.indep[i]) - this.getY(this.minScale)) * this.endScale,
                        this.y + (this.height - this.startY) - (this.points[i] - this.min) * this.heightScale,
                        halfScale, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                this.drawLine(ctx,
                        this.startX + (i - 1) * this.endScale,
                        (this.height - this.startY) - (this.points[i - 1] - this.min) * this.heightScale,
                        this.startX + i * this.endScale,
                        (this.height - this.startY) - (this.points[i] - this.min) * this.heightScale);

                ctx.beginPath();
                ctx.arc(this.x + this.startX + i * this.endScale,
                        this.y + (this.height - this.startY) - (this.points[i] - this.min) * this.heightScale,
                        halfScale, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    };

    gui.myMouseOver = function (x, y) {
        this.lastMx = x;
        this.lastMy = y;
    };

    gui.drawOnMouseValue = function (ctx) {
        var single = this.chartWidth / this.points.length;
        if (this.lastMx >= this.x + this.startX - single / 2
                && this.lastMx <= this.x + this.width - this.startX + single / 2
                && this.lastMy >= this.y + this.startY - scale
                && this.lastMy <= this.y + this.height - this.startY + scale) {
            var i = Math.floor((this.lastMx - (this.x + this.startX/* + this.minScale * this.endScale*/ - single / 2)) / single);
            if (i >= 0 && i < this.points.length) {
                ctx.font = 2 * scale + "px " + defaultFont;

                var text;
                if (!this.isIndep) {
                    text = "(" + this.indep[i] + " " + this.yUnit + ", " + this.points[i] + " " + this.xUnit + ")";
                } else {
                    text = "(" + i + ", " + this.points[i] + ")";
                }
                var width = ctx.measureText(text).width;
                var px, py;
                if (!this.isIndep) {
                    px = this.x + this.startX + (this.getY(this.indep[i]) - this.getY(this.minScale)) * this.endScale;
                    py = this.y + (this.height - this.startY) - (this.points[i] - this.min) * this.heightScale;
                } else {
                    px = this.x + this.startX + i * this.endScale;
                    py = this.y + (this.height - this.startY) - (this.points[i] - this.min) * this.heightScale;
                }

                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px, this.lastMy);
                ctx.stroke();

                ctx.fillStyle = "black";
                ctx.beginPath();
                ctx.arc(px, py, halfScale, 0, 2 * Math.PI);
                ctx.fill();

                ctx.beginPath();
                ctx.rect(px - width / 2 - scale, this.lastMy - 3 * scale, width + 2 * scale, 4 * scale);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.stroke();
                ctx.textAlign = "center";
                ctx.fillStyle = "black";

                ctx.fillText(text, px, this.lastMy);
            }
        }
    };

    gui.getShortNumber = function (num) {
        var add = "";
        var tmpNum = 0;
        if (num < 0) {
            num = -num;
            add = "-";
        }
        if (num < 1000) {
            if (num > 10) {
                return add + num.toFixed(2);
            } else if (num >= 0.01) {
                return add + num.toFixed(3);
            } else {
                tmpNum = 0;
                while (num * 10 < 10) {
                    num *= 10;
                    tmpNum++;
                }
                return add + num.toFixed(2) + "e-" + tmpNum;
            }
        } else {
            var tmpNum = 0;
            while (num / 10 >= 1) {
                num /= 10;
                tmpNum++;
            }
            return add + num.toFixed(2) + "e" + tmpNum;
        }
    };

    gui.drawLine = function (ctx, xa, ya, xb, yb) {
        ctx.beginPath();
        ctx.moveTo(this.x + xa, this.y + ya);
        ctx.lineTo(this.x + xb, this.y + yb);
        ctx.stroke();
    };

    gui.getY = function (value) {
        if (this.isLog) {
            return value > 0 ? Math.log(value) : Math.log(-value);
        } else {
            return value;
        }
    };

    gui.getValue = function (y) {
        if (this.isLog) {
            return Math.pow(Math.E, y);
        } else {
            return y;
        }
    };

    return gui;
}
