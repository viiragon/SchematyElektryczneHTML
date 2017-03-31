window.ReImg = {
    OutputProcessor: function (encodedData, name) {

        var isPng = function () {
            return encodedData.indexOf('data:image/png') === 0;
        };

        var downloadImage = function (data, fileName) {
            var a = document.getElementById("download");
            a.href = data;
            a.download = fileName;
            a.click();
            a.href = "";
        };

        var downloadFile = function (data, fileName) {
            var a = document.getElementById("download");
            var blob = new Blob([data], {type:'text/plain'});
            a.href = window.URL.createObjectURL(blob);
            a.download = fileName;
            a.click();
            a.href = "";
        };

        return {
            downloadPng: function () {
                if (isPng()) {
                    // it's a canvas already
                    downloadImage(encodedData, name);
                    return;
                }

                // convert to canvas first
                this.toCanvas(function (canvas) {
                    downloadImage(canvas.toDataURL(), name);
                });
            },
            downloadFile: function () {
                downloadFile(encodedData, name);
            }
        };
    },
    fromCanvas: function (canvasElement) {
        var dataUrl = canvasElement.toDataURL();
        return new this.OutputProcessor(dataUrl, "image.png");
    },
    fromDiagram: function (data) {
        return new this.OutputProcessor(data, "diagram.ddt");
    },
    fromChart: function (data) {
        data = JSON.stringify(data);
        return new this.OutputProcessor(data, "data.sdt");
    }

};