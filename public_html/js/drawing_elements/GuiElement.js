/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function GuiElement(x, y, width, height, visible) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.alwaysVisible = visible;
    this.visible = visible;

    this.ix = x;
    this.iy = y;

    this.childs = [];
    this.hasChildren = false;
    this.parent = null;

    this.setUpChildren = function () {
        if (this.childs.length > 0) {
            for (var i = 0; i < this.childs.length; i++) {
                this.childs[i].refreshPlacement(this);
                this.childs[i].parent = this;
                this.childs[i].setUpChildren();
            }
            this.hasChildren = true;
        } else {
            this.hasChildren = false;
        }
    };

    this.setPos = function (x, y) {
        this.x = this.ix = x;
        this.y = this.iy = y;
        this.setUpChildren();
    };

    this.drawMe = function (c, ctx) {
        if (this.visible) {
            this.drawOnlyMe(c, ctx);
            if (this.hasChildren) {
                for (var i = 0; i < this.childs.length; i++) {
                    this.childs[i].drawMe(c, ctx);
                }
            }
        }
    };

    this.refreshPlacement = function (element) {
        this.ix = this.x + element.ix;
        this.iy = this.y + element.iy;
    };

    this.isClose = function (x, y) {
        return x >= this.ix && x <= this.ix + this.width
                && y >= this.iy && y <= this.iy + this.height;
    };

    this.onMouseOver = function (x, y) {
        if (this.visible) {
            if (this.hasChildren) {
                for (var i = 0; i < this.childs.length; i++) {
                    if (this.childs[i].onMouseOver(x, y)) {
                        return true;
                    }
                }
            }
            if (this.isClose(x, y)) {
                this.myMouseOver(x, y);
                return true;
            } else {
                this.myMouseLeave(x, y);
                if (!this.alwaysVisible) {
                    this.visible = false;
                }
            }
        }
        return false;
    };

    this.onClick = function (x, y) {
        if (this.visible) {
            if (this.hasChildren) {
                for (var i = 0; i < this.childs.length; i++) {
                    if (this.childs[i].onClick(x, y)) {
                        return true;
                    }
                }
            }
            if (this.isClose(x, y)) {
                this.myClick(x, y);
                return true;
            }
        }
        return false;
    };

    this.myMouseOver = function (x, y) {
    };

    this.myMouseLeave = function (x, y) {
    };

    this.myClick = function (x, y) {
    };

    this.drawOnlyMe = function (c, ctx) {
    };
}
