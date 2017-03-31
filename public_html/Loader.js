/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var classList = [
    ["diagram/", "DiagramDrawer", "DiagramAdministration", "DiagramLoader"],
    ["circuit_elements/", "Joint", "Element", "NetElement", "Simulation", "NetJoint"],
    ["circuit_elements/element_creators/", "LineElement", "Potentiometr", "SpstToggle", "Ground", "Transformer", "TranNP", "TranjFet", "TranMos", "Amplifier"],
    ["drawing_elements/", "LinePlacer", "GuiElement", "Cropper", "Deleter"],
    ["drawing_elements/GUI/", "ToolsGUI", "ToolsAppearer", "FileGUI", "FileAppearer", "ListAppearer", "ListGUI"],
    ["drawing_elements/GUI/parameters/", "ChangableText", "ChangableList", "VariablesList", "ChangableName", "VisibilityButton"],
    ["drawing_elements/GUI/choices/", "ChoiceTemplate"],
    ["drawing_elements/GUI/choices/tools/", "ChooseNormal", "ChooseDelete", "ChooseElement", "ChooseWires", "ChooseMoving"],
    ["drawing_elements/GUI/choices/file/", "ChooseSaveAsPNG", "ChooseBackground", "ChooseCrop", "ChooseEnableCrop"
                , "ChooseAutoCrop", "ChooseLoadDiagram", "ChooseLoadChart", "ChooseSaveAsFile", "ChooseNewDiagram", "ChooseHelp", "ChooseSimulate"],
    ["drawing_elements/GUI/simulation/", "SimulationGUI", "ExitButton", "DiagramGUI", "ChooseSaveChartAsFile", "ChooseSaveChartAsPNG"]
];

var loading = 0;

window.onload = function () {
    classNumber = 0;
    for (var i = 0; i < classList.length; i++) {
        classNumber += classList[i].length - 1;
    }
    console.log("Number of classes to load : " + classNumber);
    loadPackage();
};

function loadPackage() {
    if (loading < classList.length) {
        var folder = classList[loading];
        classNumber = classList[loading].length - 1;
        classLoaded = 0;
        for (var j = 1; j < folder.length; j++) {
            console.log("\t" + folder[0] + folder[j] + " is loading");
            $.getScript("js/" + folder[0] + folder[j] + ".js")
                    .done(function () {
                        classLoaded++;
                        console.log("\tLoaded class : " + this.url + " Remaining: " + (classNumber - classLoaded));
                        if (classLoaded === classNumber) {
                            loading++;
                            loadPackage();
                        }
                    })
                    .fail(function () {
                        classLoaded++;
                        console.log("\tFailed class : " + this.url + " Remaining: " + (classNumber - classLoaded));
                        if (classLoaded === classNumber) {
                            loading++;
                            loadPackage();
                        }
                    });
        }
    } else {
        console.log("Page loaded!");
        prepareDocument();
        document.getElementById("loading").style.display = "none";
    }
}

