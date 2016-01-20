/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * ctx.fillStyle = "#FF0000";
 * ctx.fillRect(0,0,150,75);
 * 
 * ctx.moveTo(0,0);
 * ctx.lineTo(200,100);
 * ctx.stroke();
 * 
 * ctx.beginPath();
 * ctx.arc(95,50,40,0,2*Math.PI);
 * ctx.stroke();
 * 
 * ctx.font = "30px Comic Sans MS";
 * ctx.fillStyle = "red";
 * ctx.textAlign = "center";
 * ctx.fillText("Hello World", canvas.width/2, canvas.height/2); 
 * 
 * var img = document.getElementById("scream");
 * ctx.drawImage(img, 10, 10);
 */

/* global MODE_DELETE, MODE_JOINTS, MODE_MOVE, MODE_NORMAL, Canvas2Image */

var classList = [
    ["", "Diagram"],
    ["circuit_elements/", "Joint", "Element"],
    ["circuit_elements/element_creators/", "Diode", "TmpElement"],
    ["drawing_elements/", "LinePlacer", "GuiElement", "Cropper", "Deleter"],
    ["drawing_elements/GUI/", "ToolsGUI", "ToolsAppearer", "FileGUI", "FileGUIAppearer"],
    ["drawing_elements/GUI/choices/", "ChoiceTemplate"],
    ["drawing_elements/GUI/choices/tools/", "ChooseNormal", "ChooseDelete", "ChooseElement", "ChooseWires", "ChooseMoving"],
    ["drawing_elements/GUI/choices/file/", "ChooseSaveAsPNG", "ChooseBackground", "ChooseCrop", "ChooseEnableCrop", "ChooseAutoCrop"]
];

var imageNamesList = ["wiresIcon", "normalIcon", "deleteIcon", "moveIcon", "diodeElement", "tools", "file"];
var imageList = [];

var classNumber;
var classLoaded = 0;

var DEBUG = false;
var ENABLE_BACKGROUND = true;
var ENABLE_CROPPING = false;

loadImages();

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
}

window.onload = function () {
    var folder;
    classNumber = 0;
    for (var i = 0; i < classList.length; i++) {
        classNumber += classList[i].length - 1;
    }
    console.log("Number of classes to load : " + classNumber);
    for (var i = 0; i < classList.length; i++) {
        folder = classList[i];
        for (var j = 1; j < folder.length; j++) {
            console.log("\t" + folder[0] + folder[j] + " is loading");
            $.getScript("js/" + folder[0] + folder[j] + ".js", function () {
                classLoaded++;
                console.log("\tLoaded class : " + this.url);
                if (classLoaded === classNumber) {
                    console.log("Page loaded!");
                    prepareDocument();
                }
            });
        }
    }
};

var bgl, bgc;   //Background layer object and context
var dl, dc;     //Drawing layer object and context
var svl, svc;   //Saving/Download layer object and context
var mx, my;     //Mouse x and y

var diagram;

var click;

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
        case 16:    //SHIFT
            tmpMode = mode;
            mode = MODE_MOVE;
            break;
        case 46:    //DELETE
            tmpMode = mode;
            mode = MODE_DELETE;
            break;
        case 82:    //R
            diagram.rotateElement(mx, my);
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
            mode = tmpMode;
            break;
    }
}

var tmpMx = 0, tmpMy = 0;
var diagramMoving = false;

function mouseMovement() {
    if (click === true) {
        if (!diagramMoving) {
            diagram.moveEdited(mx, my, dl, dc);
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

var a = false;

function getImage(name) {
    for (var i = 0; i < imageList.length; i++) {
        if (imageList[i].name === name) {
            return imageList[i];
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
