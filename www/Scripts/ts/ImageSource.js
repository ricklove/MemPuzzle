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
            WorkingCanvas.SHOW_WORKING_CANVAS = true;

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
                    var options = {
                        fontSize: (targetHeight),
                        //lineHeight: (self._canvas.getHeight() * 0.8), // BUG
                        top: -targetHeight * cutoffTop + textPadding,
                        left: textPadding
                    };

                    if (shouldUseSans) {
                        options.fontFamily = puzzleFontName;
                    }

                    var textObject = new fabric.Text(text, options);

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

                if (shouldUseSans) {
                    ImageSource.waitForFont(doWork, function () {
                        shouldUseSans = false;
                        doWork();
                    });
                } else {
                    doWork();
                }
            };

            ImageSource.waitForFont = function (onLoaded, onTimeout) {
                var hasFailed = false;
                setTimeout(function () {
                    hasFailed = true;
                }, 5000);

                var doTest = function () {
                    if (hasFailed) {
                        onTimeout();
                        return;
                    }

                    FontTester.preloadFont();

                    if (FontTester.isPuzzleFontReady()) {
                        onLoaded();
                        return;
                    }

                    setTimeout(doTest, 100);
                };

                doTest();
            };
            ImageSource.PUZZLE_FONT = "PuzzleFont";
            return ImageSource;
        })();
        MemPuzzle.ImageSource = ImageSource;

        var FontTester = (function () {
            function FontTester() {
            }
            FontTester.isPuzzleFontReady = function () {
                FontTester.preloadFont();
                return FontTester._isPuzzleFontReady;
            };

            FontTester.preloadFont = function () {
                if (FontTester._hasStartedPreloading) {
                    return;
                }

                FontTester._hasStartedPreloading = true;

                var doWork = function () {
                    if (Told.AppSettings && Told.Analytics && Told.Debug && window["fabric"] && fabric.Text) {
                        Told.log("ImageSource_preloadFont", "BEGIN", true);

                        var fontName = ImageSource.PUZZLE_FONT;
                        var text = "O";
                        var fontSize = 20;
                        var color = "rgb(100,100,100)";

                        var defaultFont = new fabric.Text(text, {
                            //fontFamily: fontName,
                            fontSize: fontSize,
                            top: 0,
                            left: 0,
                            color: color
                        });

                        var unknownFont = new fabric.Text(text, {
                            fontFamily: "NOT_REAL_KJKJBJV",
                            fontSize: fontSize,
                            top: 0,
                            left: 0,
                            color: color
                        });

                        var noFont = new fabric.Text(text, {
                            fontFamily: "NOFONT",
                            fontSize: fontSize,
                            top: 0,
                            left: 0,
                            color: color
                        });

                        var wCanvas = WorkingCanvas.getWorkingCanvas();
                        var fCanvas = wCanvas.getFabricCanvas();
                        fCanvas.setDimensions({ width: fontSize / 2, height: fontSize });
                        fCanvas.backgroundColor = "white";
                        fCanvas.renderAll();

                        var hashBlank = FontTester.createSimpleImageHash(wCanvas);

                        fCanvas.clear();
                        fCanvas.add(defaultFont);
                        fCanvas.renderAll();

                        var hashDefault = FontTester.createSimpleImageHash(wCanvas);

                        fCanvas.clear();
                        fCanvas.add(unknownFont);
                        fCanvas.renderAll();

                        var hashUnknown = FontTester.createSimpleImageHash(wCanvas);

                        fCanvas.clear();
                        fCanvas.add(noFont);
                        fCanvas.renderAll();

                        var hashNoFont = FontTester.createSimpleImageHash(wCanvas);

                        var testPuzzleFont = function () {
                            var puzzleFont = new fabric.Text(text, {
                                fontFamily: fontName,
                                fontSize: fontSize,
                                top: 0,
                                left: 0,
                                color: color
                            });

                            fCanvas.clear();
                            fCanvas.add(puzzleFont);
                            fCanvas.renderAll();

                            var hashPuzzleFont = FontTester.createSimpleImageHash(wCanvas);

                            var isReady = hashPuzzleFont !== hashBlank && hashPuzzleFont !== hashDefault && hashPuzzleFont !== hashUnknown && hashPuzzleFont !== hashNoFont;

                            if (isReady) {
                                FontTester._isPuzzleFontReady = true;
                                wCanvas.release();
                            } else {
                                if (FontTester._attempts < 10) {
                                    FontTester._attempts++;
                                    setTimeout(testPuzzleFont, 200 * FontTester._attempts * FontTester._attempts);
                                } else {
                                    wCanvas.release();
                                }
                            }
                        };

                        testPuzzleFont();
                    } else {
                        setTimeout(doWork, 100);
                    }
                };

                doWork();
            };

            FontTester.createSimpleImageHash = function (workingCanvas) {
                var ctx = workingCanvas.getContext();
                var imageData = ctx.getImageData(0, 0, workingCanvas.canvasElement.width, workingCanvas.canvasElement.height);
                var data = imageData.data;

                // Go through image diagonally looking for non-white pixel
                var i = 1;
                var skipSize = (Math.floor(imageData.width / 2.7) * 3) - 7;
                skipSize = Math.max(17, skipSize);

                var hash = 23;
                var rotation = Math.pow(2, 28) - 1;

                while (i < data.length) {
                    var d = data[i];
                    if (d === 255) {
                        hash *= 17 * i;
                    } else if (d === 0) {
                        hash *= 23 * i;
                    } else {
                        hash *= 29 * i * d;
                    }

                    hash %= rotation;

                    i += skipSize;
                }

                return hash;
            };
            FontTester._isPuzzleFontReady = false;

            FontTester._hasStartedPreloading = false;
            FontTester._isPreloaded = false;
            FontTester._attempts = 0;
            return FontTester;
        })();

        FontTester.preloadFont();
    })(Told.MemPuzzle || (Told.MemPuzzle = {}));
    var MemPuzzle = Told.MemPuzzle;
})(Told || (Told = {}));
