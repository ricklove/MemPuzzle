///<reference path="../typings/fabricjs/fabricjs.d.ts"/>
///<reference path="System/Debug.ts"/>
///<reference path="ImageSource.ts"/>
///<reference path="PuzzleImages.ts"/>

// MemPuzzle
module Told.MemPuzzle {

    export class MemPuzzle {

        static SNAP_PERCENT = 35;
        static PADDING_PERCENT = 30;
        static STACK_PADDING_PERCENT = 5;
        static BACKGROUNDCOLOR = "lightgrey";
        static OUTLINECOLOR = "rgb(100,100,255)";
        static OUTLINE_THICKNESS_PERCENT = 5;


        private _canvas: fabric.ICanvas = null;

        private _imageSource: ImageSource = null;
        private _puzzleImages: PuzzleImages = null;
        private _pieces: IPiece[] = null;

        private _puzzlePosition: IPuzzlePosition = null;
        private _onPuzzleComplete = () => { };


        constructor(canvasId: string) {

            Told.log("MemPuzzle_Constructor", "01 - BEGIN - Will Create fabric Canvas", true);

            var self = this;

            var canvas = self._canvas = new fabric.Canvas(canvasId, {
                hoverCursor: 'pointer',
                selection: false
            });

            Told.log("MemPuzzle_Constructor", "01_A - Will Change Background Color", true);

            canvas.backgroundColor = MemPuzzle.BACKGROUNDCOLOR;

            Told.log("MemPuzzle_Constructor", "01_A - Will Change Canvas Size", true);

            // Multiply resolution by device pixel ratio
            var dpr = 1;
            // This does not work
            //if (window.devicePixelRatio !== undefined) dpr = window.devicePixelRatio;

            canvas.setWidth(document.body.clientWidth * dpr - 20);
            canvas.setHeight(window.innerHeight * dpr - 30);

            Told.log("MemPuzzle_Constructor", "02 - Canvas Size Set - width=" + canvas.getWidth() + " height= " + canvas.getHeight(), true);

            canvas.on({
                //'mouse:down': function (e: any) {
                //    if (e.target === void 0) {
                //        self.stackPieces();
                //        canvas.renderAll();
                //    }
                //},
                'object:moving': function (e: any) {
                    var target = <fabric.IImage> e.target;
                    target.opacity = 0.5;
                    target.bringToFront();

                    // Constrain piece to inside canvas 
                    // (This will work better with clipping of puzzle pieces)
                    if (target.left < 0) {
                        target.left = 0;
                    }

                    if (target.top < 0) {
                        target.top = 0;
                    }

                    if (target.left > canvas.getWidth() - target.width) {
                        target.left = canvas.getWidth() - target.width;
                    }

                    if (target.top > canvas.getHeight() - target.height) {
                        target.top = canvas.getHeight() - target.height;
                    }


                    // Snap to target
                    if (self.canPieceSnapInPlace(<IPiece> target['_piece'])) {

                        var aTarget = self.getActualTarget(<IPiece> target['_piece']);
                        target.setLeft(aTarget.x);
                        target.setTop(aTarget.y);

                        // Lock when correct
                        //target.lockMovementX = true;
                        //target.lockMovementY = true;
                    }
                },
                'object:modified': function (e: any) {
                    var target = <fabric.IImage> e.target;

                    target.opacity = 1;

                    self.checkForComplete();
                }
            });

        }

        private getActualTarget(piece: IPiece) {
            var self = this;
            return { x: piece.pieceImage.targetX + self._puzzlePosition.x, y: piece.pieceImage.targetY + self._puzzlePosition.y };
        }

        private canPieceSnapInPlace(piece: IPiece) {
            var self = this;
            var snapPercent = MemPuzzle.SNAP_PERCENT;
            var snapRadius = Math.min(piece.pieceImage.width, piece.pieceImage.height) / 100 * snapPercent;

            var actualTarget = self.getActualTarget(piece);

            var nearness = Math.abs(actualTarget.x - piece.fabricImage.left) + Math.abs(actualTarget.y - piece.fabricImage.top);
            return nearness < snapRadius;
        }

        private checkForComplete() {
            var self = this;
            var pieces = self._pieces;
            var puzzleX = self._puzzlePosition.x;
            var puzzleY = self._puzzlePosition.y;

            var correctCount = 0;

            for (var i = 0; i < pieces.length; i++) {
                var piece = pieces[i];

                var pTarget = self.getActualTarget(piece);

                if (piece.fabricImage.left !== pTarget.x || piece.fabricImage.top !== pTarget.y) {
                    // return;
                } else {
                    correctCount++;
                }
            }

            if (correctCount !== pieces.length) {

                Told.log("CheckForComplete", "Correct Pieces = " + correctCount, true);

            } else {

                // Complete
                Told.log("CheckForComplete", "Puzzle Complete", true);
                self._onPuzzleComplete();
            }
        }

        //stackPieces(shouldStackAll= false, shouldSpreadOut= false) {
        //    var self = this;
        //    var pieces = self._pieces;
        //    var S_PERCENT = MemPuzzle.STACK_PADDING_PERCENT;
        //    var scale = self._puzzleScale;

        //    var STACK_X = S_PERCENT / 100 * self._canvas.getWidth();
        //    var STACK_Y = S_PERCENT / 100 * self._canvas.getHeight();

        //    // Use snapshots
        //    //pieces = self._snapshots;
        //    //scale = 1;


        //    var piecesNotLocked = <IPiece[]>[];

        //    for (var i = 0; i < pieces.length; i++) {

        //        var piece = pieces[i];

        //        if (shouldStackAll || !self.canPieceSnapInPlace(piece)) {

        //            piecesNotLocked.push(piece);
        //        }
        //    }

        //    var gap = (self._canvas.getWidth() - (2 * STACK_X) - (pieces[0].width * scale)) / piecesNotLocked.length;

        //    if (shouldSpreadOut) {
        //        piecesNotLocked = RandomOrder(piecesNotLocked);
        //    } else {
        //        gap = 0;
        //    }

        //    for (var i = 0; i < piecesNotLocked.length; i++) {
        //        var piece = piecesNotLocked[i];

        //        // Move to stack
        //        // NOTE: This ignores the piece button

        //        piece.image.setLeft(STACK_X - piece.x * scale + gap * i);
        //        piece.image.setTop(STACK_Y - piece.y * scale);
        //        //piece.image.bringToFront();

        //        piece.image.scale(scale);
        //    }

        //    self._canvas.renderAll();
        //    //setTimeout(self._canvas.renderAll, 10);
        //}


        public createPuzzleFromText(text: string, onPuzzleCreated = () => { }, shouldUseSans = true) {

            var self = this;

            // Release current puzzle

            if (self._imageSource !== null) {
                self._imageSource.release();
            }

            if (self._puzzleImages !== null) {
                self._puzzleImages.release();
            }

            Told.MemPuzzle.ImageSource.createImageSourceFromText(text, self._canvas.getWidth(), self._canvas.getHeight(), (imageSource) => {

                self._imageSource = imageSource;
                self.createPuzzle(imageSource, onPuzzleCreated);

            }, shouldUseSans);
        }

        private static CalculatePuzzlePosition(clientWidth: number, clientHeight: number, imageSource: ImageSource) {

            var PADDING_PERCENT = MemPuzzle.PADDING_PERCENT;

            // Calculate Image Scale
            var padding = PADDING_PERCENT / 100 * Math.min(clientWidth, clientHeight);

            var width = clientWidth - padding * 2;
            var height = clientHeight - padding * 2;

            var rWidth = width / imageSource.width;
            var rHeight = height / imageSource.height;

            var tRatio = Math.min(rWidth, rHeight);
            var sWidth = imageSource.width * tRatio;
            var sHeight = imageSource.height * tRatio;
            var sx = (width - sWidth) / 2 + padding;
            var sy = (height - sHeight) / 2 + padding;

            // Move puzzle down
            sy += padding * 0.5;

            return <IPuzzlePosition> { scale: tRatio, x: sx, y: sy, width: sWidth, height: sHeight };
        }

        private static CalculateColumnsAndRows(width: number, height: number) {

            if (width <= 0 || height <= 0) {
                return;
            }

            // Create an h*v puzzle
            var minPieceCount = 6;
            var minSideCount = 2;
            var hSideCount = minSideCount;
            var vSideCount = minSideCount;

            var maxRectRatio = 2;

            while ((hSideCount * vSideCount) < minPieceCount) {

                var widthHeightRatio = width / height;

                if (widthHeightRatio > 1) {
                    widthHeightRatio = Math.max(1, widthHeightRatio / maxRectRatio);

                    hSideCount = Math.floor(widthHeightRatio * minSideCount);
                } else {
                    widthHeightRatio = Math.min(1, widthHeightRatio * maxRectRatio);

                    vSideCount = Math.floor(1 / widthHeightRatio * minSideCount);
                }

                minSideCount++;
            }

            return { columns: hSideCount, rows: vSideCount };
        }


        private createPuzzle(imageSource: ImageSource, onPuzzleComplete= () => { }, makeOutsideFlat = true, difficulty = 0, shouldRandomizePieces = false, shouldStackPieces = true, timeToShowCompletedPuzzle= 2000) {

            Told.log("MemPuzzle_createPuzzle", "01 - Begin", true);

            var self = this;
            var PADDING_PERCENT = MemPuzzle.PADDING_PERCENT;

            var canvas = self._canvas;

            //var image = self._workingCanvas;

            // Clear Puzzle
            canvas.clear();

            // Set Puzzle complete
            self._onPuzzleComplete = onPuzzleComplete;



            // Calculate Image Scale
            var pPos = self._puzzlePosition =
                MemPuzzle.CalculatePuzzlePosition(self._canvas.getWidth(), self._canvas.getHeight(), imageSource);

            var pColumnsRows = MemPuzzle.CalculateColumnsAndRows(pPos.width, pPos.height);

            // Create images
            var pImages = self._puzzleImages =
                new Told.MemPuzzle.PuzzleImages(pColumnsRows.columns, pColumnsRows.rows, imageSource.width / imageSource.height);

            pImages.draw(imageSource, pPos.width, pPos.height);

            // Show puzzle
            self.showPuzzleOutline(pPos);
            self.showPuzzleTargetImage(pPos, pImages.whole, timeToShowCompletedPuzzle);
            Told.log("MemPuzzle_createPuzzle", "02 - show puzzle outline and target", true);

            // Show pieces
            var pieces = self._pieces = <IPiece[]>[];

            for (var i = 0; i < pImages.pieces.length; i++) {

                var pieceImage = pImages.pieces[i];

                var piece = self.showPiece({ x: pieceImage.targetX, y: pieceImage.targetY }, pieceImage);

                pieces.push(piece);
            }

        }

        private showPuzzleOutline(pPos: IPuzzlePosition) {
            var self2 = this;
            var canvas = self2._canvas;

            var T_PERCENT = MemPuzzle.OUTLINE_THICKNESS_PERCENT;

            var thickness = Math.min(pPos.width, pPos.height) * T_PERCENT / 100;

            var outline = new fabric.Rect({
                left: pPos.x - thickness,
                top: pPos.y - thickness,
                width: pPos.width + thickness * 2,
                height: pPos.height + thickness * 2,
                fill: MemPuzzle.OUTLINECOLOR,
                hasBorders: false,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true,
                selectable: false,
            });

            canvas.add(outline);

            thickness = 0;

            var inline = new fabric.Rect({
                left: pPos.x - thickness,
                top: pPos.y - thickness,
                width: pPos.width + thickness * 2,
                height: pPos.height + thickness * 2,
                fill: MemPuzzle.BACKGROUNDCOLOR,
                hasBorders: false,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true,
                selectable: false,
            });

            canvas.add(inline);
        }

        private showPuzzleTargetImage(pPos: IPuzzlePosition, whole: IPieceImage, timeToShow: number) {
            Told.log("MemPuzzle_showPuzzleTargetImage", "01 - BEGIN", true);

            var self = this;
            var canvas = self._canvas;

            var x = pPos.x;
            var y = pPos.y;

            var wholeImage = new fabric.Image(<any>whole.canvas.canvasElement, {});

            Told.log("MemPuzzle_showPuzzleTargetImage", "02 - Image Created - width=" + wholeImage.width + " height= " + wholeImage.height, true);

            wholeImage.set({
                left: x,
                top: y,

                hasBorders: false,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true,
                selectable: false,
            });

            canvas.add(wholeImage);

            setTimeout(() => {

                Told.log("MemPuzzle_showPuzzleTargetImage", "03 - END - Image Removed", true);

                wholeImage.remove();
            }, timeToShow);
        }


        private showPiece(pos: IPoint, pieceImage: IPieceImage) {
            Told.log("MemPuzzle_showPiece", "01 - BEGIN", true);

            var self = this;
            var canvas = self._canvas;

            var x = pos.x;
            var y = pos.y;

            var fImage = new fabric.Image(<any>pieceImage.canvas.canvasElement, {});

            Told.log("MemPuzzle_showPiece", "02 - Image Created - width=" + fImage.width + " height= " + fImage.height, true);

            fImage.set({
                left: x,
                top: y,

                perPixelTargetFind: true,
                targetFindTolerance: 4,

                hasBorders: false,
                hasControls: false,
                //lockMovementX: false,
                //lockMovementY: false,
                //selectable: true,
            });

            var piece = { fabricImage: fImage, pieceImage: pieceImage };
            fImage["_piece"] = piece;

            canvas.add(fImage);

            return piece;
        }
    }

    interface IPuzzlePosition {
        scale: number;
        x: number;
        y: number;
        width: number;
        height: number;
    }

    interface IPiece {
        fabricImage: fabric.IImage;
        pieceImage: IPieceImage;
    }

    function RandomOrder<T>(items: T[]): T[] {
        var remaining = items.map(p=> p);
        var random = <T[]>[];

        while (remaining.length > 0) {
            var r = remaining.splice(Math.floor(Math.random() * remaining.length), 1);
            random.push(r[0]);
        }

        return random;
    }

}