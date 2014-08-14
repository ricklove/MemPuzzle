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
                this._imageSource = null;
                this._puzzleImages = null;
                this._pieces = null;
                this._puzzlePosition = null;
                this._onPuzzleComplete = function () {
                };
                Told.log("MemPuzzle_Constructor", "01 - BEGIN - Will Create fabric Canvas", true);

                var self = this;

                var canvas = self._canvas = new fabric.Canvas(canvasId, {
                    hoverCursor: 'pointer',
                    selection: false
                });

                // Handle resize
                window.onresize = function (event) {
                    self.resize();
                };

                Told.log("MemPuzzle_Constructor", "01_A - Will Change Background Color", true);

                canvas.backgroundColor = MemPuzzle.BACKGROUNDCOLOR;

                Told.log("MemPuzzle_Constructor", "01_A - Will Change Canvas Size", true);

                self.setCanvasSize();

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
                            var aTarget = self.getActualTarget(target['_piece']);
                            target.setLeft(aTarget.x);
                            target.setTop(aTarget.y);
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
            MemPuzzle.prototype.getActualTarget = function (piece) {
                var self = this;
                return { x: piece.pieceImage.targetX + self._puzzlePosition.x, y: piece.pieceImage.targetY + self._puzzlePosition.y };
            };

            MemPuzzle.prototype.canPieceSnapInPlace = function (piece) {
                var self = this;
                var snapPercent = MemPuzzle.SNAP_PERCENT;
                var snapRadius = Math.min(piece.pieceImage.width, piece.pieceImage.height) / 100 * snapPercent;

                var actualTarget = self.getActualTarget(piece);

                var nearness = Math.abs(actualTarget.x - piece.fabricImage.left) + Math.abs(actualTarget.y - piece.fabricImage.top);
                return nearness < snapRadius;
            };

            MemPuzzle.prototype.checkForComplete = function () {
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
                    self.showOnePiece();
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

                var STACK_X = S_PERCENT / 100 * self._canvas.getWidth();
                var STACK_Y = S_PERCENT / 100 * self._canvas.getHeight();

                var piecesNotLocked = [];

                for (var i = 0; i < pieces.length; i++) {
                    var piece = pieces[i];

                    if (shouldStackAll || !self.canPieceSnapInPlace(piece)) {
                        piecesNotLocked.push(piece);
                    }
                }

                var spreadGap = (self._canvas.getWidth() - (2 * STACK_X) - (pieces[0].pieceImage.width)) / piecesNotLocked.length;

                if (shouldSpreadOut) {
                    piecesNotLocked = RandomOrder(piecesNotLocked);
                } else {
                    spreadGap = 0;
                }

                for (var i = 0; i < piecesNotLocked.length; i++) {
                    var piece = piecesNotLocked[i];

                    // Move to stack
                    piece.fabricImage.setLeft(STACK_X + spreadGap * i);
                    piece.fabricImage.setTop(STACK_Y);
                }

                self._canvas.renderAll();
            };

            MemPuzzle.prototype.showOnePiece = function () {
                var self = this;
                var pieces = self._pieces;

                var piecesNotLocked = [];
                var pieceToShow = null;

                var isVisible = function (p) {
                    return self._canvas._objects.indexOf(p.fabricImage) > 0;
                };

                for (var i = 0; i < pieces.length; i++) {
                    var piece = pieces[i];

                    if (!self.canPieceSnapInPlace(piece)) {
                        piecesNotLocked.push(piece);

                        if (isVisible(piece)) {
                            pieceToShow = piece;
                        }
                    }
                }

                if (pieceToShow === null) {
                    pieceToShow = RandomItem(piecesNotLocked);
                }

                for (var i = 0; i < piecesNotLocked.length; i++) {
                    var piece = piecesNotLocked[i];

                    if (piece !== pieceToShow) {
                        if (isVisible(piece)) {
                            piece.fabricImage.remove();
                        }
                    } else {
                        if (!isVisible(piece)) {
                            self._canvas.add(piece.fabricImage);
                        }
                    }
                }
            };

            MemPuzzle.prototype.createPuzzleFromText = function (text, onPuzzleCreated, shouldUseSans) {
                if (typeof onPuzzleCreated === "undefined") { onPuzzleCreated = function () {
                }; }
                if (typeof shouldUseSans === "undefined") { shouldUseSans = true; }
                var self = this;

                // Release current puzzle
                if (self._imageSource !== null) {
                    self._imageSource.release();
                }

                if (self._puzzleImages !== null) {
                    self._puzzleImages.release();
                }

                Told.MemPuzzle.ImageSource.createImageSourceFromText(text, self._canvas.getWidth(), self._canvas.getHeight(), function (imageSource) {
                    self._imageSource = imageSource;
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

            MemPuzzle.CalculateColumnsAndRows = function (widthOverHeightRatio) {
                // Create an h*v puzzle
                var minPieceCount = 6;
                var minSideCount = 2;
                var hSideCount = minSideCount;
                var vSideCount = minSideCount;

                var maxRectRatio = 2;

                while ((hSideCount * vSideCount) < minPieceCount) {
                    if (widthOverHeightRatio > 1) {
                        widthOverHeightRatio = Math.max(1, widthOverHeightRatio / maxRectRatio);

                        hSideCount = Math.floor(widthOverHeightRatio * minSideCount);
                    } else {
                        widthOverHeightRatio = Math.min(1, widthOverHeightRatio * maxRectRatio);

                        vSideCount = Math.floor(1 / widthOverHeightRatio * minSideCount);
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

                // Set Puzzle complete
                self._onPuzzleComplete = onPuzzleComplete;

                // Create images
                var pColumnsRows = MemPuzzle.CalculateColumnsAndRows(imageSource.width / imageSource.height);

                var pImages = self._puzzleImages = new Told.MemPuzzle.PuzzleImages(pColumnsRows.columns, pColumnsRows.rows, imageSource.width / imageSource.height);

                self.drawPuzzle(imageSource, timeToShowCompletedPuzzle);
            };

            MemPuzzle.prototype.setCanvasSize = function () {
                var canvas = this._canvas;

                // Multiply resolution by device pixel ratio
                var dpr = 1;

                // This does not work
                //if (window.devicePixelRatio !== undefined) dpr = window.devicePixelRatio;
                canvas.setWidth(document.body.clientWidth * dpr - 20);
                canvas.setHeight(window.innerHeight * dpr - 30);
            };

            MemPuzzle.prototype.resize = function () {
                this.setCanvasSize();
                this.drawPuzzle(this._imageSource, 0, false);
            };

            MemPuzzle.prototype.drawPuzzle = function (imageSource, timeToShowCompletedPuzzle, isResize) {
                if (typeof isResize === "undefined") { isResize = false; }
                var self = this;
                var canvas = self._canvas;
                var pImages = self._puzzleImages;

                // Clear Puzzle
                canvas.clear();

                // Calculate Image Scale
                var pPos = self._puzzlePosition = MemPuzzle.CalculatePuzzlePosition(self._canvas.getWidth(), self._canvas.getHeight(), imageSource);

                // Draw images
                pImages.draw(imageSource, pPos.width, pPos.height);

                // Show puzzle
                self.showPuzzleOutline(pPos);
                if (!isResize) {
                    self.showPuzzleTargetImage(pPos, pImages.whole, timeToShowCompletedPuzzle);
                }

                Told.log("MemPuzzle_createPuzzle", "02 - show puzzle outline and target", true);

                // Show pieces
                var pieces = self._pieces = [];

                for (var i = 0; i < pImages.pieces.length; i++) {
                    var pieceImage = pImages.pieces[i];

                    var piece = self.createPiece({ x: pieceImage.targetX, y: pieceImage.targetY }, pieceImage);

                    pieces.push(piece);
                }

                // Stack pieces
                self.stackPieces();

                // Show one piece
                self.showOnePiece();
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

            MemPuzzle.prototype.createPiece = function (pos, pieceImage) {
                Told.log("MemPuzzle_showPiece", "01 - BEGIN", true);

                var self = this;
                var canvas = self._canvas;

                var x = pos.x;
                var y = pos.y;

                var fImage = new fabric.Image(pieceImage.canvas.canvasElement, {});

                Told.log("MemPuzzle_showPiece", "02 - Image Created - width=" + fImage.width + " height= " + fImage.height, true);

                fImage.set({
                    left: x,
                    top: y,
                    //perPixelTargetFind: true,
                    //targetFindTolerance: 4,
                    hasBorders: false,
                    hasControls: false
                });

                var piece = { fabricImage: fImage, pieceImage: pieceImage };
                fImage["_piece"] = piece;

                //canvas.add(fImage);
                return piece;
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

        function RandomItem(items) {
            return items[Math.floor(Math.random() * items.length)];
        }

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
