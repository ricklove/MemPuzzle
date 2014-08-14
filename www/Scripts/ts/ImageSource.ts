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

            var puzzleFontName = "PuzzleFont";
            var serifFontName = "DOES NOT EXIST";

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

                var textObject = new fabric.Text(text, <fabric.ITextOptions> {
                    fontFamily: shouldUseSans ? puzzleFontName : serifFontName,
                    fontSize: (targetHeight),
                    //lineHeight: (self._canvas.getHeight() * 0.8), // BUG
                    top: -targetHeight * cutoffTop + textPadding,
                    left: textPadding,
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

}