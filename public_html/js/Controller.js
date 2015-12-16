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

var classList = [
    ["", "Diagram"],
    ["circuit_elements/", "Joint", "Element"],
    ["circuit_elements/elements/", "Diode"],
    ["drawing_elements/", "LinePlacer"]
];

var classNumber;
var classLoaded = 0;

var DEBUG = false;

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
    console.log("\n");
};

var bgl, bgc;   //Background layer object and context
var dl, dc;     //Drawing layer object and context
var mx, my;     //Mouse x and y

var diagram;

var click;

var placingId = 0;  //Co kładziemy

function prepareDocument() {
    var plane = document.getElementById("plane");
    bgl = document.getElementById("backgroundLayer");
    bgc = bgl.getContext("2d");
    dl = document.getElementById("drawLayer");
    dc = dl.getContext("2d");
    click = false;
    plane.width = bgl.width = dl.width = $(window).width() * 0.9;
    plane.height = bgl.height = dl.height = $(window).height() * 0.9;
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
    });
    $("#plane").mouseup(function () {
        mouseReleased();
        diagram.drawBackground(bgl, bgc);
        click = false;
    });
    $("#dioda").click(function () {
        placingId = 1;
    });
}

function mouseMovement() {
    if (click === true) {
        diagram.moveEdited(mx, my, dl, dc);
    }
}

function mouseClicked() {
    diagram.addElementInPlace(placingId, mx, my);
    placingId = 0;
}

function mouseReleased() {
    diagram.discardEdited();
}

function setMousePos(evt) {
    var rect = bgl.getBoundingClientRect();
    mx = evt.clientX - rect.left;
    my = evt.clientY - rect.top;
}
