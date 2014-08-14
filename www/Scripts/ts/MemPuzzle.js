///<reference path="../typings/fabricjs/fabricjs.d.ts"/>
///<reference path="System/Debug.ts"/>
///<reference path="ImageSource.ts"/>
///<reference path="PuzzleImages.ts"/>
var Told;
(function (Told) {
    // MemPuzzle
    (function (_MemPuzzle) {
        var MemPuzzle = (function () {
            function MemPuzzle(canvasId) {
                this._canvas = null;
                this._puzzlePosition = null;
                this._onPuzzleComplete = function () {
                };
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
                    'object:moving': function (e) {
                        var target = e.target;
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
                        if (self.canPieceSnapInPlace(target['_piece'])) {
                            // TODO: Implement this
                            //target.setLeft(self._puzzleX);
                            //target.setTop(self._puzzleY);
                            // Lock when correct
                            //target.lockMovementX = true;
                            //target.lockMovementY = true;
                        }
                    },
                    'object:modified': function (e) {
                        var target = e.target;

                        target.opacity = 1;

                        self.checkForComplete();
                    }
                });
            }
            MemPuzzle.prototype.canPieceSnapInPlace = function (piece) {
                var self = this;
                var snapPercent = MemPuzzle.SNAP_PERCENT;

                var snapRadius = Math.min(piece.width, piece.height) / 100 * snapPercent;

                var nearness = Math.abs(piece.targetImageLeft - piece.image.left) + Math.abs(piece.targetImageTop - piece.image.top);
                return nearness < snapRadius;
            };

            MemPuzzle.prototype.checkForComplete = function () {
                var self = this;
                var pieces = self._pieces;
                var puzzleX = self._puzzleX;
                var puzzleY = self._puzzleY;

                var correctCount = 0;

                for (var i = 0; i < pieces.length; i++) {
                    var piece = pieces[i];

                    if (piece.image.left !== puzzleX || piece.image.top !== puzzleY) {
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
            };

            MemPuzzle.prototype.stackPieces = function (shouldStackAll, shouldSpreadOut) {
                if (typeof shouldStackAll === "undefined") { shouldStackAll = false; }
                if (typeof shouldSpreadOut === "undefined") { shouldSpreadOut = false; }
                var self = this;
                var pieces = self._pieces;
                var S_PERCENT = MemPuzzle.STACK_PADDING_PERCENT;
                var scale = self._puzzleScale;

                var STACK_X = S_PERCENT / 100 * self._canvas.getWidth();
                var STACK_Y = S_PERCENT / 100 * self._canvas.getHeight();

                // Use snapshots
                //pieces = self._snapshots;
                //scale = 1;
                var piecesNotLocked = [];

                for (var i = 0; i < pieces.length; i++) {
                    var piece = pieces[i];

                    if (shouldStackAll || !self.canPieceSnapInPlace(piece)) {
                        piecesNotLocked.push(piece);
                    }
                }

                var gap = (self._canvas.getWidth() - (2 * STACK_X) - (pieces[0].width * scale)) / piecesNotLocked.length;

                if (shouldSpreadOut) {
                    piecesNotLocked = RandomOrder(piecesNotLocked);
                } else {
                    gap = 0;
                }

                for (var i = 0; i < piecesNotLocked.length; i++) {
                    var piece = piecesNotLocked[i];

                    // Move to stack
                    // NOTE: This ignores the piece button
                    piece.image.setLeft(STACK_X - piece.x * scale + gap * i);
                    piece.image.setTop(STACK_Y - piece.y * scale);

                    //piece.image.bringToFront();
                    piece.image.scale(scale);
                }

                self._canvas.renderAll();
                //setTimeout(self._canvas.renderAll, 10);
            };

            MemPuzzle.prototype.createPuzzleFromText = function (text, onPuzzleCreated, shouldUseSans) {
                if (typeof onPuzzleCreated === "undefined") { onPuzzleCreated = function () {
                }; }
                if (typeof shouldUseSans === "undefined") { shouldUseSans = true; }
                var self = this;

                Told.MemPuzzle.ImageSource.createImageSourceFromText(text, self._canvas.getWidth(), self._canvas.getHeight(), function (imageSource) {
                    self.createPuzzle(imageSource, onPuzzleCreated);
                }, shouldUseSans);
            };

            MemPuzzle.CalculatePuzzlePosition = function (clientWidth, clientHeight, imageSource) {
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

                return { scale: tRatio, x: sx, y: sy, width: sWidth, height: sHeight };
            };

            MemPuzzle.CalculateColumnsAndRows = function (width, height) {
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
            };

            MemPuzzle.prototype.createPuzzle = function (imageSource, onPuzzleComplete, makeOutsideFlat, difficulty, shouldRandomizePieces, shouldStackPieces, timeToShowCompletedPuzzle) {
                if (typeof onPuzzleComplete === "undefined") { onPuzzleComplete = function () {
                }; }
                if (typeof makeOutsideFlat === "undefined") { makeOutsideFlat = true; }
                if (typeof difficulty === "undefined") { difficulty = 0; }
                if (typeof shouldRandomizePieces === "undefined") { shouldRandomizePieces = false; }
                if (typeof shouldStackPieces === "undefined") { shouldStackPieces = true; }
                if (typeof timeToShowCompletedPuzzle === "undefined") { timeToShowCompletedPuzzle = 2000; }
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
                var pPos = self._puzzlePosition = MemPuzzle.CalculatePuzzlePosition(self._canvas.getWidth(), self._canvas.getHeight(), imageSource);

                var pColumnsRows = MemPuzzle.CalculateColumnsAndRows(pPos.width, pPos.height);

                // Create images
                var pImages = new Told.MemPuzzle.PuzzleImages(pColumnsRows.columns, pColumnsRows.rows, imageSource.width / imageSource.height);
                pImages.draw(imageSource, pPos.width, pPos.height);

                // Show puzzle
                self.showPuzzleOutline(pPos);
                self.showPuzzleTargetImage(pPos, pImages.whole, timeToShowCompletedPuzzle);
                Told.log("MemPuzzle_createPuzzle", "02 - show puzzle outline and target", true);

                for (var i = 0; i < pImages.pieces.length; i++) {
                    var pieceImage = pImages.pieces[i];

                    self.showPiece({ x: pieceImage.targetX, y: pieceImage.targetY }, pieceImage);
                }
            };

            MemPuzzle.prototype.showPuzzleOutline = function (pPos) {
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
                    selectable: false
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
                    selectable: false
                });

                canvas.add(inline);
            };

            MemPuzzle.prototype.showPuzzleTargetImage = function (pPos, whole, timeToShow) {
                Told.log("MemPuzzle_showPuzzleTargetImage", "01 - BEGIN", true);

                var self = this;
                var canvas = self._canvas;

                var x = pPos.x;
                var y = pPos.y;

                var wholeImage = new fabric.Image(whole.canvas.canvasElement, {});

                Told.log("MemPuzzle_showPuzzleTargetImage", "02 - Image Created - width=" + wholeImage.width + " height= " + wholeImage.height, true);

                wholeImage.set({
                    left: x,
                    top: y,
                    hasBorders: false,
                    hasControls: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    selectable: false
                });

                canvas.add(wholeImage);

                setTimeout(function () {
                    Told.log("MemPuzzle_showPuzzleTargetImage", "03 - END - Image Removed", true);

                    wholeImage.remove();
                }, timeToShow);
            };

            MemPuzzle.prototype.showPiece = function (pos, piece) {
                Told.log("MemPuzzle_showPiece", "01 - BEGIN", true);

                var self = this;
                var canvas = self._canvas;

                var x = pos.x;
                var y = pos.y;

                var fImage = new fabric.Image(piece.canvas.canvasElement, {});

                Told.log("MemPuzzle_showPiece", "02 - Image Created - width=" + fImage.width + " height= " + fImage.height, true);

                fImage.set({
                    left: x,
                    top: y,
                    perPixelTargetFind: true,
                    targetFindTolerance: 4,
                    hasBorders: false,
                    hasControls: false
                });

                canvas.add(fImage);
            };
            MemPuzzle.SNAP_PERCENT = 35;
            MemPuzzle.PADDING_PERCENT = 30;
            MemPuzzle.STACK_PADDING_PERCENT = 5;
            MemPuzzle.BACKGROUNDCOLOR = "lightgrey";
            MemPuzzle.OUTLINECOLOR = "rgb(100,100,255)";
            MemPuzzle.OUTLINE_THICKNESS_PERCENT = 5;
            return MemPuzzle;
        })();
        _MemPuzzle.MemPuzzle = MemPuzzle;

        function RandomOrder(items) {
            var remaining = items.map(function (p) {
                return p;
            });
            var random = [];

            while (remaining.length > 0) {
                var r = remaining.splice(Math.floor(Math.random() * remaining.length), 1);
                random.push(r[0]);
            }

            return random;
        }
    })(Told.MemPuzzle || (Told.MemPuzzle = {}));
    var MemPuzzle = Told.MemPuzzle;
})(Told || (Told = {}));
