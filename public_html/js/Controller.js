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
            , "motor", "transformer", "lamp", "fuse", "amplifier"
            , "acSimulation", "dcSimulation"];
var imageList = [];

var elementConstructorTable;

var classNumber;
var classLoaded = 0;

var DEBUG = false;
var ENABLE_BACKGROUND = true;
var ENABLE_CROPPING = false;
var ENABLE_KEYBOARD = true;

var TMP_DIAGRAM_NAME = "TMP";

var SERVER_ADDRESS = "http://localhost/";
var IS_SERVER_WORKING = false;

loadImages();
checkIfServerIsWorking();

if (window.onload === null) {   //Jeżeli nie użyty zostal skrypt Loader.js
    window.onload = function () {
        prepareDocument();
    };
}

//Wyłączanie menu kontekstowego prawego przycisku
if (document.addEventListener) { // IE >= 9 + wyszystko inne
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
} else { // IE < 9
    document.attachEvent('oncontextmenu', function () {
        window.event.returnValue = false;
    });
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

var leftClick, rightClick;  //Czy wcisnieta mysz

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
    leftClick = false;
    plane.width = bgl.width = dl.width = svl.width = $(window).width();
    plane.height = bgl.height = dl.height = svl.height = $(window).height();
    diagram = new Diagram(bgl.width, bgl.height);
    diagram.drawBackground(bgl, bgc);

    $("#plane").mousemove(function (evt) {
        setMousePos(evt);
        mouseMovement();
        diagram.drawWorkingLayer(dl, dc, mx, my);
    });
    $("#plane").mousedown(function (evt) {
        switch (evt.which) {
            case 1:
                leftClick = true;
                leftMouseClicked();
                break;
            case 3:
                rightClick = true;
                rightMouseClicked();
                break;
        }
        diagram.drawWorkingLayer(dl, dc, mx, my);
    });
    $("#plane").mouseup(function (evt) {
        switch (evt.which) {
            case 1:
                leftMouseReleased();
                diagram.drawBackground(bgl, bgc);
                leftClick = false;
                break;
            case 3:
                rightMouseReleased();
                diagram.drawBackground(bgl, bgc);
                rightClick = false;
                break;
        }
    });
    window.addEventListener("keydown", function (evt) {
        if (!keyPressed && ENABLE_KEYBOARD) {
            keyboardPressed(evt.keyCode);
            diagram.drawWorkingLayer(dl, dc, mx, my);
            diagram.drawBackground(bgl, bgc);
            keyPressed = true;
        }
    }, false);
    window.addEventListener("keyup", function (evt) {
        if (keyPressed && ENABLE_KEYBOARD) {
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

    var diagramData = getCookieDiagram(TMP_DIAGRAM_NAME);
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
        case 83:    //S
            saveDiagramToFile();
            break;
        case 73:    //I
            saveImage();
            break;
        case 67:    //C
            if (confirm("Do you want to load a diagram from cookies?\nAny unsaved progress will be lost!")) {
                loadDiagramFromCookie();
            }
        case 68:    //D
            DEBUG = !DEBUG;
            console.log(diagram.getDiagramNetlist());
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
    if (leftClick) {
        if (!diagramMoving) {
            diagram.moveEdited(mx, my);
        } else {
            diagram.moveDiagram(tmpMx + mx, tmpMy + my);
            diagram.drawBackground(bgl, bgc);
        }
    } else if (rightClick) {
        if (diagramMoving) {
            diagram.moveDiagram(tmpMx + mx, tmpMy + my);
            diagram.drawBackground(bgl, bgc);
        }
    }
}

function leftMouseClicked() {
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


function rightMouseClicked() {
    //console.log(diagram.getDiagramNetlist());
    if (!leftClick) {
        if (!diagram.checkVariableListsInPlace(mx, my)) {
            diagramMoving = true;
            tmpMx = diagram.xoffset - mx;
            tmpMy = diagram.yoffset - my;
        }
    } else {
        diagram.rotateElement(mx, my);
    }
}

function leftMouseReleased() {
    diagram.discardEdited();
    diagramMoving = false;
}

function rightMouseReleased() {
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

function refreshDrawingLayer() {
    diagram.drawWorkingLayer(dl, dc, mx, my);
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
    setCookieDiagram(TMP_DIAGRAM_NAME, diagram.saveDiagram());
}

function loadDiagramFromCookie() {
    diagram.loadDiagram(getCookieDiagram(TMP_DIAGRAM_NAME));
    diagram.drawBackground(bgl, bgc);
}

function setCookieDiagram(name, text) {
    var d = new Date();
    d.setTime(d.getTime() + (3650 * 24 * 60 * 60 * 1000));  //10 lat do przodu.... :D
    var expires = "expires=" + d.toUTCString();
    document.cookie = "diagram" + name + "Save=" + text + "; " + expires;
}

function getCookieDiagram(name) {
    var cookieName = "diagram" + name + "Save=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1);
        if (c.indexOf(cookieName) === 0)
            return c.substring(cookieName.length, c.length);
    }
    return "";
}

function deleteCookieDiagram(name) {
    document.cookie = "diagram" + name + "Save=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

function checkIfServerIsWorking() {
    $.get(SERVER_ADDRESS + "isActive.py", function (data) {
        if (data["status"] === "OK") {
            IS_SERVER_WORKING = true;
            /*calculateNetlist(['Vac:V1 in gnd U="1 V" f="1 kHz"'
             , 'R:R1 out in R="1 kOhm"'
             , 'C:C1 out gnd C="10 nF"'
             , '.AC:AC1 Type="log" Start="1 Hz" Stop="10 MHz" Points="300" Noise="no"']);*/
        }
    }, "json").fail(function (data) {
        console.log("Brak połączenia z serwerem : " + data.status);
        IS_SERVER_WORKING = false;
    });
}

var IS_WAITING_FOR_CALCULATION = false;
var calculatedData;

function simulate() {
    var diagram = getNetlist();
    calculateNetlist(diagram, function (data) {
        var list = (typeof data) + "\n";
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                list += key + " :";
                var isDict = !(Array.isArray(data[key]));
                for (var item in data[key]) {
                    if (isDict) {
                        list += " (" + item + ": " + data[key][item] + ")";
                    } else {
                        list += " " + data[key][item];
                    }
                }
                list += "\n";
            }
        }
        alert(list);
    });
}

function calculateNetlist(netlist, action) {
    if (IS_SERVER_WORKING) {
        IS_WAITING_FOR_CALCULATION = true;
        $.post(SERVER_ADDRESS + "calculate.py", {netlist: netlist}, function (data) {
            IS_WAITING_FOR_CALCULATION = false;
            var calculatedData = {};
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    if (Array.isArray(data[key])) {
                        calculatedData[key] = [];
                        var regex = /[+-]?\d+(\.\d+)?/g;
                        for (var item in data[key]) {
                            if (data[key][item].charAt(0) === 'c') {
                                var floats = data[key][item].match(regex).map(function(v) { return parseFloat(v); })
                                if (floats.length > 1) {
                                    calculatedData[key][item] = floats[0];
                                } else {
                                    calculatedData[key][item] = 0.0;
                                }
                            } else {
                                calculatedData[key][item] = parseFloat(data[key][item]);
                            }
                        }
                    } else {
                        calculatedData[key] = data[key];
                    }
                }
            }
            if (typeof action !== 'undefined') {
                action(calculatedData);
            }
        }, "json").fail(function (data) {
            IS_WAITING_FOR_CALCULATION = false;
            switch (data.status) {
                case 404:
                    alert("Wystąpił problem podczas próby połączenia się z serwerem. Spróbuj ponownie");
                    break;
                case 500:
                    alert("Błąd serwera?... Wzywaj admina!");
                    break;
                default:
                    alert("Wystąpił niespodziewany błąd. Spróbuj ponownie");
                    break;
            }
        });
    }
}

function isServerCalculating() {
    return IS_SERVER_WORKING && IS_WAITING_FOR_CALCULATION;
}

function getCalculatedData() {
    var data = null;
    if (!isServerCalculating()) {
        data = calculatedData;
        calculatedData = null;
    }
    return data;
}

function reloadDiagram() {
    diagram.loadDiagram(diagram.saveDiagram());
}
