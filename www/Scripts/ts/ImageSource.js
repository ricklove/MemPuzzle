///<reference path="../typings/fabricjs/fabricjs.d.ts"/>
///<reference path="System/Debug.ts"/>
var Told;
(function (Told) {
    (function (MemPuzzle) {
        var WorkingCanvas = (function () {
            function WorkingCanvas() {
                this.canvasElement = null;
                this.isFree = false;
                this._fabricCanvas = null;
                this._context = null;
            }
            WorkingCanvas.getWorkingCanvas = function () {
                var self = this;
                var cList = WorkingCanvas.canvasList;

                var wCanvas = null;

                for (var i = 0; i < cList.length; i++) {
                    if (cList[i].isFree) {
                        wCanvas = cList[i];
                        break;
                    }
                }

                if (wCanvas === null) {
                    var element = document.createElement("canvas");
                    element.setAttribute('id', '_temp_canvas_' + cList.length);

                    document.body.appendChild(element);

                    if (!WorkingCanvas.SHOW_WORKING_CANVAS) {
                        element.setAttribute("style", "display:none");
                    }

                    wCanvas = new WorkingCanvas();
                    wCanvas.canvasElement = element;

                    cList.push(wCanvas);
                }

                wCanvas.isFree = false;
                return wCanvas;
            };

            WorkingCanvas.prototype.getFabricCanvas = function () {
                if (this._fabricCanvas === null) {
                    this._fabricCanvas = new fabric.StaticCanvas(this.canvasElement.id);
                }

                return this._fabricCanvas;
            };

            WorkingCanvas.prototype.getContext = function () {
                if (this._context === null) {
                    this._context = this.canvasElement.getContext("2d");
                }

                return this._context;
            };

            WorkingCanvas.prototype.release = function () {
                this.isFree = true;
            };
            WorkingCanvas.SHOW_WORKING_CANVAS = false;

            WorkingCanvas.canvasList = [];
            return WorkingCanvas;
        })();
        MemPuzzle.WorkingCanvas = WorkingCanvas;

        var ImageSource = (function () {
            function ImageSource() {
            }
            ImageSource.prototype.release = function () {
                this._workingCanvas.release();
            };

            //createPuzzleFromImage(imgUrl: string) {
            //    var self = this;
            //    fabric.Image.fromURL(imgUrl, function (img) {
            //        var image = self._imageCanvasElement;
            //        if (image === null) {
            //            image = self._imageCanvasElement = document.createElement("canvas");
            //        }
            //        image.width = img.width;
            //        image.height = img.height;
            //        var context = image.getContext('2d');
            //        context.clearRect(0, 0, image.width, image.height);
            //        // Draw Image
            //        context.drawImage(img.getElement(), 0, 0, image.width, image.height);
            //        // Save Data
            //        self._imageData = image.toDataURL();
            //        self.createPuzzle();
            //    });
            //}
            ImageSource.createImageSourceFromText = function (text, targetWidth, targetHeight, onCreated, shouldUseSans) {
                if (typeof onCreated === "undefined") { onCreated = function (imageSource) {
                }; }
                if (typeof shouldUseSans === "undefined") { shouldUseSans = false; }
                Told.log("ImageSource_createImageSourceFromText", "BEGIN - text:" + text, true);

                var puzzleFontName = ImageSource.PUZZLE_FONT;
                var serifFontName = "DOES NOT EXIST";

                var doWork = function () {
                    var wCanvas = WorkingCanvas.getWorkingCanvas();
                    var fCanvas = wCanvas.getFabricCanvas();

                    fCanvas.setWidth(targetWidth);
                    fCanvas.setHeight(targetHeight);
                    fCanvas.clear();

                    // Draw Text
                    var textPadding = 10;
                    var cutoffTop = 0.25;
                    var cutoffHeightKeep = 0.8;

                    //cutoffTop = 0.25;
                    //cutoffHeightKeep = 0.9;
                    var textObject = new fabric.Text(text, {
                        fontFamily: shouldUseSans ? puzzleFontName : serifFontName,
                        fontSize: (targetHeight),
                        //lineHeight: (self._canvas.getHeight() * 0.8), // BUG
                        top: -targetHeight * cutoffTop + textPadding,
                        left: textPadding
                    });
                    fCanvas.add(textObject);

                    // Set to fit text
                    fCanvas.backgroundColor = "white";
                    fCanvas.setWidth(textObject.width + textPadding * 2);
                    fCanvas.setHeight(textObject.height * cutoffHeightKeep + textPadding * 2);

                    fCanvas.renderAll();

                    Told.log("ImageSource_createImageSourceFromText", "END", true);

                    var imageSource = new ImageSource();
                    imageSource.imageOrCanvas = wCanvas.canvasElement;
                    imageSource.width = fCanvas.getWidth();
                    imageSource.height = fCanvas.getHeight();

                    imageSource._workingCanvas = wCanvas;

                    imageSource.text = text;
                    imageSource.textLineCount = 1;
                    imageSource.textMaxLineLength = text.length;

                    onCreated(imageSource);
                };

                doWork();
                //if (shouldUseSans) {
                //    self.waitForFont(puzzleFontName, doWork, doWork);
                //} else {
                //    doWork();
                //}
            };

            ImageSource.preloadFont = function () {
                if (ImageSource._isPreloaded) {
                    return;
                }

                ImageSource._isPreloaded = true;

                var doWork = function () {
                    if (Told.AppSettings && Told.Analytics && Told.Debug && window["fabric"] && fabric.Text) {
                        Told.log("ImageSource_preloadFont", "BEGIN", true);

                        var fontName = ImageSource.PUZZLE_FONT;
                        var text = "test";
                        var fontSize = 20;

                        var myFont = new fabric.Text(text, {
                            fontFamily: fontName,
                            fontSize: fontSize,
                            top: 10
                        });

                        var wCanvas = WorkingCanvas.getWorkingCanvas();
                        wCanvas.getFabricCanvas().add(myFont);
                        wCanvas.release();
                    } else {
                        setTimeout(doWork, 100);
                    }
                };

                doWork();
            };
            ImageSource.PUZZLE_FONT = "PuzzleFont";

            ImageSource._isPreloaded = false;
            return ImageSource;
        })();
        MemPuzzle.ImageSource = ImageSource;

        ImageSource.preloadFont();
    })(Told.MemPuzzle || (Told.MemPuzzle = {}));
    var MemPuzzle = Told.MemPuzzle;
})(Told || (Told = {}));
