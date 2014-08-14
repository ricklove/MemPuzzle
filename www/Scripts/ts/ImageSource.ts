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

                ImageSource.preloadFont();

                if (ImageSource._isPreloaded) {
                    onLoaded();
                    return;
                }

                setTimeout(doTest, 100);
            };

            doTest();
        }

        private static _hasStartedPreloading = false;
        private static _isPreloaded = false;
        private static _attempts = 0;
        static preloadFont() {

            if (ImageSource._hasStartedPreloading) {
                return;
            }

            ImageSource._hasStartedPreloading = true;

            var doWork = () => {
                if (Told.AppSettings
                    && Told.Analytics
                    && Told.Debug
                    && window["fabric"]
                    && fabric.Text) {

                    Told.log("ImageSource_preloadFont", "BEGIN", true);

                    var fontName = ImageSource.PUZZLE_FONT;
                    var text = "O";
                    var fontSize = 20;

                    var myFont = new fabric.Text(text, <fabric.ITextOptions> {
                        fontFamily: fontName,
                        fontSize: fontSize,
                        top: 0,
                        left: 0,
                    });

                    myFont.setColor("rgb(100,100,100)");

                    var wCanvas = WorkingCanvas.getWorkingCanvas();
                    var fCanvas = wCanvas.getFabricCanvas();
                    fCanvas.add(myFont);
                    fCanvas.setDimensions({ width: fontSize / 2, height: fontSize });
                    fCanvas.backgroundColor = "white";
                    fCanvas.renderAll();

                    // Evaluate
                    var isNonWhite = ImageSource.evaluateIfAnyPixelHasColor(wCanvas);

                    wCanvas.release();

                    if (isNonWhite) {
                        ImageSource._isPreloaded = isNonWhite;
                    } else {
                        ImageSource._attempts++;

                        if (ImageSource._attempts < 10) {
                            setTimeout(doWork, 1000);
                        }
                    }

                } else {
                    setTimeout(doWork, 100);
                }
            };

            doWork();
        }

        private static evaluateIfAnyPixelHasColor(workingCanvas: WorkingCanvas) {

            var ctx = workingCanvas.getContext();
            var imageData = ctx.getImageData(0, 0, workingCanvas.canvasElement.width, workingCanvas.canvasElement.height);
            var data = imageData.data;

            // Go through image diagonally looking for non-white pixel
            var i = 1;
            var skipSize = 17;

            while (i < data.length) {

                i += skipSize;

                if (data[i] !== 255 && data[0] !== 0) {
                    return true;
                }
            }

            return false;
        }

        //private waitForFont(fontName: string, onLoadedCallback: () => void, onTimeoutCallback: () => void) {
        //    var self = this;

        //    var text = ".iJk ,@#$1230;',./?";

        //    var offset = -10000;
        //    var fontsize = 300;

        //    // DEBUG
        //    offset = 0;
        //    fontsize = 30;

        //    var noFont = new fabric.Text(text, <fabric.ITextOptions> {
        //        fontFamily: "NOFONT",
        //        fontSize: fontsize,
        //        top: 20 + offset,
        //    });

        //    var myFont = new fabric.Text(text, <fabric.ITextOptions> {
        //        fontFamily: fontName,
        //        fontSize: fontsize,
        //        top: 120 + offset,
        //    });

        //    var wCanvas = self.getWorkingCanvas();
        //    wCanvas.add(noFont);
        //    wCanvas.add(myFont);

        //    var hasFailed = false;
        //    setTimeout(() => { hasFailed = true; }, 5000);

        //    var doTest = () => {

        //        if (hasFailed) {
        //            onTimeoutCallback();
        //            return;
        //        }

        //        wCanvas.renderAll();

        //        if (noFont.width !== myFont.width) {
        //            onLoadedCallback();
        //            return;
        //        }

        //        setTimeout(doTest, 100);
        //    };

        //    doTest();
        //    //setTimeout(doTest, 100);
        //}

    }

    ImageSource.preloadFont();
}