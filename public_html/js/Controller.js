/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global MODE_DELETE, MODE_JOINTS, MODE_MOVE, MODE_NORMAL, Canvas2Image, elementChoosers */



var imageNamesList = ["wiresIcon", "normalIcon", "deleteIcon", "moveIcon", "tools", "file"];
var elementNamesList = ["spstToggle", "spdtToggle", "buttonSwitchNO", "buttonSwitchNC"
            , "earthGround", "chassisGround"
            , "resistorIEEE", "resistorIEC", "potentiometrIEEE", "potentiometrIEC", "varResistorIEEE", "varResistorIEC"
            , "trimResistor", "thermistor", "capacitor", "polCapacitor", "varCapacitor"
            , "inductor", "coreInductor", "varInductor"
            , "volSource", "currSource", "ACVolSource", "generator", "cell", "contrVolSource", "contrCurrSource"
            , "voltmeter", "ammeter", "ohmmeter", "wattmeter"
            , "diode", "zenDiode", "schDiode", "variDiode", "tunnelDiode", "led", "photodiode"
            , "npn", "pnp", "jfetn", "jfetp", "nmos", "pmos"
            , "motor", "transformer", "lamp", "fuse", "amplifier"];
var imageList = [];

var elementConstructorTable;

var classNumber;
var classLoaded = 0;

var DEBUG = false;
var ENABLE_BACKGROUND = true;
var ENABLE_CROPPING = false;

loadImages();

if (window.onload === null) {   //Jeżeli nie użyty zostal skrypt Loader.js
    window.onload = function () {
        prepareDocument();
    };
}

function loadImages() {
    console.log("Number of images to load : " + imageNamesList.length);
    for (var i = 0; i < imageNamesList.length; i++) {
        var image = new Image();
        image.src = "images/" + imageNamesList[i] + ".png";
        image.name = imageNamesList[i];
        console.log("\t" + image.name + " is loading");
        image.onload = function () {
            imageList.push(this);
            console.log("\t" + this.name + " loaded");
        };
    }
    console.log("Number of element images to load : " + elementNamesList.length);
    for (var i = 0; i < elementNamesList.length; i++) {
        var image = new Image();
        image.src = "images/elements/" + elementNamesList[i] + ".png";
        image.name = elementNamesList[i];
        console.log("\t" + image.name + " is loading");
        image.onload = function () {
            imageList.push(this);
            console.log("\t" + this.name + " loaded");
        };
    }
}

var bgl, bgc;   //Background layer object and context
var dl, dc;     //Drawing layer object and context
var svl, svc;   //Saving/Download layer object and context
var mx, my;     //Mouse x and y

var diagram;

var click;  //Czy wcisnieta mysz

var placingId = 0;  //Co kładziemy

var defaultFont = "Lucida Console";

var keyPressed;
var tmpMode = 0;

function prepareDocument() {
    var plane = document.getElementById("plane");
    bgl = document.getElementById("backgroundLayer");
    bgc = bgl.getContext("2d");
    dl = document.getElementById("drawLayer");
    dc = dl.getContext("2d");
    svl = document.getElementById("downloadLayer");
    svc = svl.getContext("2d");
    click = false;
    plane.width = bgl.width = dl.width = svl.width = $(window).width();
    plane.height = bgl.height = dl.height = svl.height = $(window).height();
    diagram = new Diagram(bgl.width, bgl.height);
    diagram.drawBackground(bgl, bgc);

    $("#plane").mousemove(function (evt) {
        setMousePos(evt);
        mouseMovement();
        diagram.drawWorkingLayer(dl, dc, mx, my);
    });
    $("#plane").mousedown(function () {
        click = true;
        mouseClicked();
        diagram.drawWorkingLayer(dl, dc, mx, my);
    });
    $("#plane").mouseup(function () {
        mouseReleased();
        diagram.drawBackground(bgl, bgc);
        click = false;
    });
    window.addEventListener("keydown", function (evt) {
        if (!keyPressed) {
            keyboardPressed(evt.keyCode);
            diagram.drawWorkingLayer(dl, dc, mx, my);
            diagram.drawBackground(bgl, bgc);
            keyPressed = true;
        }
    }, false);
    window.addEventListener("keyup", function (evt) {
        if (keyPressed) {
            keyboardReleased(evt.keyCode);
            diagram.drawWorkingLayer(dl, dc, mx, my);
            diagram.drawBackground(bgl, bgc);
            keyPressed = false;
        }
    }, false);

    var files = document.getElementById("files");

    files.addEventListener("change", function (evt) {
        var file = evt.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                diagram.loadDiagram(e.target.result);
                diagram.drawBackground(bgl, bgc);
            };
            console.log("Loading file: " + file.name);
            reader.readAsText(file);
        } else {
            alert("Failed to load file");
        }
    });

    var diagramData = getCookieDiagram();
    if (diagramData !== "") {
        console.log("Diagram save data found in cookies. Loading cookie diagram");
        diagram.loadDiagram(diagramData);
        diagram.drawBackground(bgl, bgc);
    }

    $(window).on("beforeunload", function () {
        saveDiagramToCookie();
    });

    if (!bgc.setLineDash) {
        console.log("context.setLineDash is not supported in this browser - dashed lines will not work!");
        bgc.setLineDash = dc.setLineDash = svc.setLineDash = function () {
        };
    }
}

function keyboardPressed(key) {
    if (DEBUG) {
        console.log("down: " + key);
    }
    switch (key) {
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:    //1 - 5
            elementChoosers[key - 49].myClick();
            break;
        case 16:    //SHIFT
            tmpMode = mode;
            mode = MODE_MOVE;
            break;
        case 17:    //CTRL
            mode = MODE_NORMAL;
            break;
        case 46:    //DELETE
            tmpMode = mode;
            mode = MODE_DELETE;
            break;
        case 74:    //J
            tmpMode = mode;
            mode = MODE_JOINTS;
            break;
        case 82:    //R
            diagram.rotateElement(mx, my);
            break;
        case 67:    //C
            if (confirm("Do you want to load a diagram from cookies?\nAny unsaved progress will be lost!")) {
                loadDiagramFromCookie();
            }
        case 68:    //D
            DEBUG = !DEBUG;
            break;
    }
}

function keyboardReleased(key) {
    if (DEBUG) {
        console.log("up: " + key);
    }
    switch (key) {
        case 16:
        case 82:
        case 46:
        case 74:
            mode = tmpMode;
            break;
    }
}

var tmpMx = 0, tmpMy = 0;
var diagramMoving = false;

function mouseMovement() {
    if (click === true) {
        if (!diagramMoving) {
            diagram.moveEdited(mx, my);
        } else {
            diagram.moveDiagram(tmpMx + mx, tmpMy + my);
            diagram.drawBackground(bgl, bgc);
        }
    }
}

function mouseClicked() {
    if (!diagram.checkGUIInPlace(mx, my)) {
        switch (mode) {
            case MODE_NORMAL:
                diagram.addElementInPlace(placingId, mx, my);
                placingId = 0;
                break;
            case MODE_JOINTS:
                diagram.addJointInPlace(mx, my);
                break;
            case MODE_DELETE:
                diagram.deleteElementInPlace(mx, my);
                break;
            case MODE_MOVE:
                diagramMoving = true;
                tmpMx = diagram.xoffset - mx;
                tmpMy = diagram.yoffset - my;
                break;
        }
    }
}

function mouseReleased() {
    diagram.discardEdited();
    diagramMoving = false;
}

function setMousePos(evt) {
    var rect = bgl.getBoundingClientRect();
    mx = evt.clientX - rect.left;
    my = evt.clientY - rect.top;
}

function getImage(name) {
    if (name !== null) {
        for (var i = 0; i < imageList.length; i++) {
            if (imageList[i].name === name) {
                return imageList[i];
            }
        }
    }
    return null;
}

function saveImage() {
    var tmp = mode;
    mode = MODE_NORMAL;
    diagram.drawBackgroundForImage(svl, svc, ENABLE_BACKGROUND);
    ReImg.fromCanvas(svl).downloadPng();
    svl.width = $(window).width();
    svl.height = $(window).height();
    mode = tmp;
}


function clearDiagram() {
    diagram.clearDiagram();
    diagram.drawBackground(bgl, bgc);
}

function saveDiagramToFile() {
    ReImg.fromDiagram(diagram.saveDiagram()).downloadFile();
}

function saveDiagramToCookie() {
    setCookieDiagram(diagram.saveDiagram());
}

function loadDiagramFromCookie() {
    diagram.loadDiagram(getCookieDiagram());
    diagram.drawBackground(bgl, bgc);
}

function setCookieDiagram(text) {
    var d = new Date();
    d.setTime(d.getTime() + (3650 * 24 * 60 * 60 * 1000));  //10 lat do przodu.... :D
    var expires = "expires=" + d.toUTCString();
    document.cookie = "diagramSave=" + text + "; " + expires;
}

function getCookieDiagram() {
    var name = "diagramSave=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1);
        if (c.indexOf(name) === 0)
            return c.substring(name.length, c.length);
    }
    return "";
}

function deleteCookieDiagram() {
    document.cookie = "diagramSave=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

function reloadDiagram() {
    diagram.loadDiagram(diagram.saveDiagram());
}
