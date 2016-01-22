window.ReImg = {
    OutputProcessor: function (encodedData, svgElement) {

        var isPng = function () {
            return encodedData.indexOf('data:image/png') === 0;
        };

        var downloadImage = function (data) {
            var a = document.getElementById("download");
            a.href = data;
            a.download = "image.png";
            a.click();
            a.href = "";
        };

        var downloadFile = function (data) {
            var a = document.getElementById("download");
            var blob = new Blob([data], {type:'text/plain'});
            a.href = window.URL.createObjectURL(blob);
            a.download = "diagram.txt";
            a.click();
            a.href = "";
        };

        return {
            downloadPng: function () {
                if (isPng()) {
                    // it's a canvas already
                    downloadImage(encodedData);
                    return;
                }

                // convert to canvas first
                this.toCanvas(function (canvas) {
                    downloadImage(canvas.toDataURL());
                });
            },
            downloadFile: function () {
                downloadFile(encodedData);
            }
        };
    },
    fromCanvas: function (canvasElement) {
        var dataUrl = canvasElement.toDataURL();
        return new this.OutputProcessor(dataUrl);
    },
    fromDiagram: function (data) {
        return new this.OutputProcessor(data);
    }

};