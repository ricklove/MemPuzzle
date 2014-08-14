///<reference path="../typings/fabricjs/fabricjs.d.ts"/>
///<reference path="System/Debug.ts"/>


module Told.MemPuzzle {

    export class WorkingCanvas {

        static SHOW_WORKING_CANVAS = false;

        static canvasList = <WorkingCanvas[]>[];

        static getWorkingCanvas(): WorkingCanvas {
            var self = this;
            var cList = WorkingCanvas.canvasList;

            var wCanvas = null;

            // Find free canvas
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
        }

        public canvasElement: HTMLCanvasElement = null;
        public isFree = false;
        private _fabricCanvas: fabric.IStaticCanvas = null;
        private _context: CanvasRenderingContext2D = null;

        public getFabricCanvas() {
            if (this._fabricCanvas === null) {
                this._fabricCanvas = new fabric.StaticCanvas(this.canvasElement.id);
            }

            return this._fabricCanvas;
        }

        public getContext() {
            if (this._context === null) {
                this._context = this.canvasElement.getContext("2d");
            }

            return this._context;
        }

        public release() {
            this.isFree = true;
        }
    }

    export class ImageSource {

        static PUZZLE_FONT = "PuzzleFont";

        private _workingCanvas: WorkingCanvas;

        public imageOrCanvas: any;
        public width: number;
        public height: number;

        public text: string;
        public textLineCount: number;
        public textMaxLineLength: number;

        release() {
            this._workingCanvas.release();
        }


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

        static createImageSourceFromText(text: string, targetWidth: number, targetHeight: number, onCreated= (imageSource: ImageSource) => { }, shouldUseSans= false) {

            Told.log("ImageSource_createImageSourceFromText", "BEGIN - text:" + text, true);

            var puzzleFontName = ImageSource.PUZZLE_FONT;

            var doWork = () => {
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

                var options = <fabric.ITextOptions> {
                    fontSize: (targetHeight),
                    //lineHeight: (self._canvas.getHeight() * 0.8), // BUG
                    top: -targetHeight * cutoffTop + textPadding,
                    left: textPadding,
                }

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
                ImageSource.waitForFont(doWork, () => {
                    shouldUseSans = false;
                    doWork();
                });
            } else {
                doWork();
            }
        }

        private static waitForFont(onLoaded: () => void, onTimeout: () => void) {
            var hasFailed = false;
            setTimeout(() => { hasFailed = true; }, 5000);

            var doTest = () => {

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
        }

    }

    class FontTester {

        public static isPuzzleFontReady() {
            FontTester.preloadFont();
            return FontTester._isPuzzleFontReady;
        }

        private static _isPuzzleFontReady = false;


        private static _hasStartedPreloading = false;
        private static _isPreloaded = false;
        private static _attempts = 0;

        static preloadFont() {

            if (FontTester._hasStartedPreloading) {
                return;
            }

            FontTester._hasStartedPreloading = true;

            var doWork = () => {

                if (Told.AppSettings &&
                    Told.Analytics &&
                    Told.Debug &&
                    window["fabric"] &&
                    fabric.Text) {

                    Told.log("ImageSource_preloadFont", "BEGIN", true);

                    var fontName = ImageSource.PUZZLE_FONT;
                    var text = "O";
                    var fontSize = 20;
                    var color = "rgb(100,100,100)";

                    var defaultFont = new fabric.Text(text, <fabric.ITextOptions> {
                        //fontFamily: fontName,
                        fontSize: fontSize,
                        top: 0,
                        left: 0,
                        color: color
                    });

                    var unknownFont = new fabric.Text(text, <fabric.ITextOptions> {
                        fontFamily: "NOT_REAL_KJKJBJV",
                        fontSize: fontSize,
                        top: 0,
                        left: 0,
                        color: color
                    });

                    var noFont = new fabric.Text(text, <fabric.ITextOptions> {
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

                    var testPuzzleFont = () => {
                        var puzzleFont = new fabric.Text(text, <fabric.ITextOptions> {
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

                        var isReady = hashPuzzleFont !== hashBlank
                            && hashPuzzleFont !== hashDefault
                            && hashPuzzleFont !== hashUnknown
                            && hashPuzzleFont !== hashNoFont;

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
                    }

                    testPuzzleFont();

                } else {
                    setTimeout(doWork, 100);
                }
            };

            doWork();
        }

        private static createSimpleImageHash(workingCanvas: WorkingCanvas) {
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
        }

    }

    FontTester.preloadFont();
}