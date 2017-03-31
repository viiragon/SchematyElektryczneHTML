/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Element, DEBUG, Joint, ENABLE_CROPPING, placingId, Cropper, Deleter, Diode, elementNamesList, LineElement, SpstToggle, EarthGround, ChassisGround, PotentiometrIEEE, PotentiometrIEC, Amplifier, Transformer, PMOS, NMOS, JFETP, JFETN, PNP, NPN, NonRotableLineElement, Resistor, Capacitor, Inductor, DCVoltageSource, diagram, GuiElement, Simulation, ACSimulation, DCSimulation, scale, mode, MODE_MOVE, halfScale, CROP_ELEMENT, lineWidth, snapDistance, MODE_JOINTS */

function extendDiagramByDrawing(diagram) {

    diagram.clearScreen = function (l, lc) {
        lc.beginPath();
        lc.clearRect(0, 0, l.width, l.height);
    };

    diagram.drawBackground = function (bgl, bgc) {
        bgc.save();
        this.clearScreen(bgl, bgc);
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            bgc.translate(this.xoffset, this.yoffset);
        }
        this.drawOnlyBackground(bgl, bgc);
        for (var i = 0; i < this.simulation.length; i++) {
            if (this.simulation[i].placed) {
                this.simulation[i].drawMe(bgl, bgc);
            }
        }
        this.cropper.drawMe(bgl, bgc);
        bgc.restore();
        this.GUI[0].drawOnlyMe(bgl, bgc);
        this.GUI[1].drawOnlyMe(bgl, bgc);
    };

    diagram.drawBackgroundForImage = function (bgl, bgc, background) {
        if (ENABLE_CROPPING && this.cropper.isUsable()) {
            bgl.width = this.cropper.getWidth();
            bgl.height = this.cropper.getHeight();
        }
        bgc.save();
        if (background) {
            bgc.beginPath();
            bgc.rect(0, 0, bgl.width, bgl.height);
            bgc.fillStyle = 'white';
            bgc.fill();
        } else {
            this.clearScreen(bgl, bgc);
        }
        if (ENABLE_CROPPING && this.cropper.isUsable()) {
            bgc.translate(-this.cropper.getXStart(), -this.cropper.getYStart());
        }
        this.drawOnlyBackground(bgl, bgc);
        bgc.restore();
    };

    diagram.drawChartForImage = function (bgl, bgc) {
        bgl.width = this.simulationGUI.getChartWidth();
        bgl.height = this.simulationGUI.getChartHeight();
        bgc.save();
        bgc.beginPath();
        bgc.rect(0, 0, bgl.width, bgl.height);
        bgc.fillStyle = 'white';
        bgc.fill();
        this.simulationGUI.drawChartForImage(bgc);
        bgc.restore();
    };

    diagram.drawOnlyBackground = function (bgl, bgc) {
        for (var i = 0; i < this.joints.length; i++) {
            this.joints[i].drawMe(bgl, bgc);
        }
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].placed) {
                this.elements[i].drawMe(bgl, bgc);
            }
        }
        for (var i = 0; i < this.netJoints.length; i++) {
            this.netJoints[i].drawMe(bgl, bgc);
        }
    };

    diagram.drawWorkingLayer = function (dl, dc, mx, my) {
        dc.save();
        this.clearScreen(dl, dc);
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            dc.translate(this.xoffset, this.yoffset);
            mx -= this.xoffset;
            my -= this.yoffset;
        }
        if (this.edited.id !== null) {
            if (this.edited instanceof Joint) {
                this.placer.drawMe(dl, dc);
                this.highlightJoints(dl, dc, this.placer.x, this.placer.y, this.edited);
            } else if (this.edited instanceof Element) {
                this.edited.drawMe(dl, dc);
                var joint;
                for (var i = 0; i < this.edited.joints.length; i++) {
                    joint = this.edited.joints[i];
                    if (this.highlightJoints(dl, dc, joint.x, joint.y, joint)) {
                        break;
                    }
                }
            } else {
                this.edited.drawMe(dl, dc);
                if (!this.edited instanceof Cropper && !this.edited instanceof Deleter) {
                    this.highlightJoints(dl, dc, this.edited.x, this.edited.y, this.edited);
                }
            }
        } else {
            if (!this.highlightNetJoints(dl, dc, mx, my)
                    && !this.highlightJoints(dl, dc, mx, my, this.edited)
                    && !this.highlightElements(dl, dc, mx, my, this.edited)
                    && mode === MODE_JOINTS) {
                this.drawJoint(dl, dc, mx, my);
            }
        }
        dc.restore();
        if (this.xoffset !== 0 || this.yoffset !== 0) {
            mx += this.xoffset;
            my += this.yoffset;
        }
        if (!this.simulationGUI.visible) {
            for (var i = 0; i < this.GUI.length; i++) {
                if (this.edited.id === null) {
                    this.GUI[i].onMouseOver(mx, my);
                }
                this.GUI[i].drawMe(dl, dc);
            }
        } else {
            if (this.edited.id === null) {
                this.simulationGUI.onMouseOver(mx, my);
            }
            this.simulationGUI.drawMe(dl, dc);
        }
        this.drawCursor(dl, dc, mx, my);
    };

    diagram.drawJoint = function (dl, dc, mx, my) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        dc.beginPath();
        dc.arc(mx, my, snapDistance, 0, 2 * Math.PI);
        dc.strokeStyle = 'blue';
        dc.lineWidth = lineWidth;
        dc.stroke();

        dc.beginPath();
        dc.arc(mx, my, halfScale, 0, 2 * Math.PI);
        dc.fillStyle = 'black';
        dc.fill();
    };

    diagram.drawCursor = function (dl, dc, mx, my) {
        if (placingId === CROP_ELEMENT || mode === MODE_MOVE) {
            mx = Math.floor(mx / scale) * scale;
            my = Math.floor(my / scale) * scale;
            dc.beginPath();
            dc.arc(mx, my, halfScale, 0, 2 * Math.PI);
            dc.fillStyle = mode !== MODE_MOVE ? '#7DDEFF' : '#0F2CFF';
            dc.fill();
        }
    };

    diagram.highlightJoints = function (dl, dc, mx, my, edited) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        for (var i = 0; i < this.joints.length; i++) {
            if (this.joints[i].id !== edited.id) {
                if (this.joints[i].highlightMe(mx, my, dl, dc)) {
                    return true;
                }
            }
        }
        return false;
    };

    diagram.highlightNetJoints = function (dl, dc, mx, my) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        for (var i = 0; i < this.netJoints.length; i++) {
            if (this.netJoints[i].highlightMe(mx, my, dl, dc)) {
                return true;
            }
        }
        return false;
    };

    diagram.highlightElements = function (dl, dc, mx, my, edited) {
        mx = Math.floor(mx / scale) * scale;
        my = Math.floor(my / scale) * scale;
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].id !== edited.id) {
                if (this.elements[i].highlightMe(mx, my, dl, dc)) {
                    return true;
                }
            }
        }
        for (var i = 0; i < this.simulation.length; i++) {
            if (this.simulation[i].id !== edited.id) {
                if (this.simulation[i].highlightMe(mx, my, dl, dc)) {
                    return true;
                }
            }
        }
        return false;
    };
}
