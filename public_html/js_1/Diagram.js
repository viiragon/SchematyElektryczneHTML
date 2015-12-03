/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var LINE_ELEM = 0;

var nullElement = {
    id: -1
};

var snapDistance; //Odległość po której obiekt jest wychwytywany

function distance(sx, sy, ex, ey) {
    return Math.max(Math.abs(sx - ex), Math.abs(sy - ey));
}

function Diagram(width, height) {
    this.width = width;
    this.height = height;
    snapDistance = Math.min(width, height) / 60;
    this.edited = nullElement;
    this.selected = nullElement;
    this.elements = [new Line(width / 3, height / 2, 2 * width / 3, height / 2)];
    this.elements[0].id = 0;
    this.elements[0].direction = DIR_HORIZONTAL;

    this.addElementInPlace = function (code, x, y) {
        switch (code) {
            case LINE_ELEM:
                var joint = this.findClosestJoint(x, y);
                if (joint.id !== -1) {
                    var line = new Line(joint.x, joint.y, x, y);
                    line.sJoint = joint;
                    joint.addElement(line);
                    this.addElementEdited(line);
                }
                break;

        }
    };

    this.addElement = function (element) {
        this.elements.push(element);
        element.id = this.elements.length - 1;
    };

    this.addElementEdited = function (element) {
        this.edited = element;
        this.selected = nullElement;
        this.addElement(element);
    };

    this.moveEdited = function (x, y) {
        if (this.edited.id !== -1) {
            this.edited.setPos(x, y);
        }
    };

    this.discardEdited = function () {
        if (this.edited instanceof Line) {
            var joint = this.findClosestJoint(this.edited.ex, this.edited.ey);
            if (joint.id !== -1) {
                this.edited.eJoint = joint;
                joint.addElement(this.edited);
                this.edited.ex = joint.x;
                this.edited.ey = joint.y;
            }
            this.edited.simplify();
        }
        this.selected = this.edited;
        this.edited = nullElement;
    };

    this.deleteElement = function (element) {
        if (element.id !== -1) {
            this.elements.splice(element.id, 1);
            for (var i = 0; i < this.elements.length; i++)
                this.elements[i].id = i;
        }
    };

    this.deleteSelected = function () {
        if (this.selected.id !== -1) {
            this.deleteElement(this.selected);
            this.selected = nullElement;
        }
    };

    this.clearScreen = function (l, lc) {
        lc.beginPath();
        lc.rect(0, 0, l.width, l.height);
        lc.fillStyle = 'white';
        lc.fill();
        lc.clearRect(0, 0, l.width, l.height);
    };

    this.drawBackground = function (bgl, bgc) {
        this.clearScreen(bgl, bgc);
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].drawMe(bgl, bgc);
        }
    };

    this.drawWorkingLayer = function (dl, dc, mx, my) {
        this.clearScreen(dl, dc);
        if (this.edited.id !== -1) {
            this.edited.drawMe(dl, dc);
            if (this.edited instanceof Line) {
                this.highlightElements(dl, dc, this.edited.ex, this.edited.ey);
            }
        } else
            this.highlightElements(dl, dc, mx, my);
    };

    this.highlightElements = function (dl, dc, mx, my) {
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].id !== this.edited.id) {
                if (this.elements[i].highlightMe(mx, my, dl, dc)) {
                    break;
                }
            }
        }
    };

    this.findClosestJoint = function (mx, my) {
        var joint;
        for (var i = 0; i < this.elements.length; i++) {
            joint = this.elements[i].getClosestJoint(mx, my);
            if (joint !== null)
                return joint;
        }
        return nullElement;
    };
}


