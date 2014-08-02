﻿///<reference path="../typings/fabricjs/fabricjs.d.ts"/>
var TOLD;
(function (TOLD) {
    (function (_MemPuzzle) {
        var MemPuzzle = (function () {
            function MemPuzzle(canvasId) {
                this._canvas = null;
                //private _imageCanvasElement: HTMLCanvasElement = null;
                this._imageCanvas = null;
                this._imageData = null;
                this._puzzleScale = null;
                this._puzzleX = 0;
                this._puzzleY = 0;
                this._puzzleWidth = 0;
                this._puzzleHeight = 0;
                this._pieces = null;
                this._onPuzzleComplete = function () {
                };
                var self = this;
                var LOCKRADIUS = MemPuzzle.LOCKRADIUS;

                var canvas = self._canvas = new fabric.Canvas(canvasId, {
                    hoverCursor: 'pointer',
                    selection: false
                });

                canvas.backgroundColor = "lightgrey";
                canvas.setWidth(document.body.clientWidth - 20);
                canvas.setHeight(window.innerHeight - 30);

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

                        // Snap to target
                        var nearness = Math.abs(self._puzzleX - target.left) + Math.abs(self._puzzleY - target.top);
                        if (nearness < LOCKRADIUS) {
                            target.setLeft(self._puzzleX);
                            target.setTop(self._puzzleY);
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
            MemPuzzle.prototype.checkForComplete = function () {
                var self = this;
                var pieces = self._pieces;
                var puzzleX = self._puzzleX;
                var puzzleY = self._puzzleY;

                for (var i = 0; i < pieces.length; i++) {
                    var piece = pieces[i];

                    if (piece.image.left !== puzzleX || piece.image.top !== puzzleY) {
                        return;
                    }
                }

                // Complete
                self._onPuzzleComplete();
            };

            MemPuzzle.prototype.stackPieces = function (shouldStackAll, shouldSpreadOut) {
                if (typeof shouldStackAll === "undefined") { shouldStackAll = false; }
                if (typeof shouldSpreadOut === "undefined") { shouldSpreadOut = false; }
                var self = this;
                var pieces = self._pieces;
                var LOCKRADIUS = MemPuzzle.LOCKRADIUS;
                var STACK_X = MemPuzzle.STACK_X;
                var STACK_Y = MemPuzzle.STACK_Y;
                var scale = self._puzzleScale;

                var piecesNotLocked = [];

                for (var i = 0; i < pieces.length; i++) {
                    var piece = pieces[i];

                    var nearness = Math.abs(self._puzzleX - piece.image.left) + Math.abs(self._puzzleY - piece.image.top);

                    if (shouldStackAll || nearness > LOCKRADIUS) {
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
                    piece.image.setLeft(STACK_X - piece.x * scale + gap * i);
                    piece.image.setTop(STACK_Y - piece.y * scale);

                    //piece.image.bringToFront();
                    piece.image.scale(scale);
                }

                self._canvas.renderAll();
                //setTimeout(self._canvas.renderAll, 10);
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
            MemPuzzle.prototype.getImageCanvas = function () {
                var self = this;

                var image = self._imageCanvas;

                if (image === null) {
                    var element = document.createElement("canvas");
                    element.setAttribute('id', '_temp_canvas');
                    image = self._imageCanvas = new fabric.Canvas('_temp_canvas');
                    image.renderOnAddition = false;
                }

                return image;
            };

            MemPuzzle.prototype.createPuzzleFromText = function (text, onPuzzleComplete, shouldUseSans) {
                if (typeof onPuzzleComplete === "undefined") { onPuzzleComplete = function () {
                }; }
                if (typeof shouldUseSans === "undefined") { shouldUseSans = false; }
                var self = this;

                var puzzleFontName = "PuzzleFont";
                var serifFontName = "DOES NOT EXIST";

                var doWork = function () {
                    var image = self.getImageCanvas();

                    image.setWidth(self._canvas.getWidth());
                    image.setHeight(self._canvas.getHeight());

                    //image._objects = [];
                    image.clear();

                    // Draw Text
                    var textPadding = 10;
                    var cutoffTop = 0.25;
                    var cutoffHeightKeep = 0.8;

                    //cutoffTop = 0.25;
                    //cutoffHeightKeep = 0.9;
                    var textObject = new fabric.Text(text, {
                        fontFamily: shouldUseSans ? puzzleFontName : serifFontName,
                        fontSize: (self._canvas.getHeight()),
                        //lineHeight: (self._canvas.getHeight() * 0.8), // BUG
                        top: -self._canvas.getHeight() * cutoffTop + textPadding,
                        left: textPadding
                    });
                    image.add(textObject);

                    // Set to fit text
                    image.backgroundColor = "white";
                    image.setWidth(textObject.width + textPadding * 2);
                    image.setHeight(textObject.height * cutoffHeightKeep + textPadding * 2);

                    image.renderAll();

                    //setTimeout(() => {
                    //    //Re-render
                    //    image.renderAll();
                    // Save Data
                    self._imageData = image.toDataURL("png");

                    self.createPuzzle(onPuzzleComplete);
                    //}, 100);
                };

                if (shouldUseSans) {
                    self.waitForFont(puzzleFontName, doWork, doWork);
                } else {
                    doWork();
                }
            };

            MemPuzzle.prototype.waitForFont = function (fontName, onLoadedCallback, onTimeoutCallback) {
                var self = this;

                var text = ".iJk ,@#$1230;',./?";

                var offset = -10000;
                var fontsize = 300;

                // DEBUG
                offset = 0;
                fontsize = 30;

                var noFont = new fabric.Text(text, {
                    fontFamily: "NOFONT",
                    fontSize: fontsize,
                    top: 20 + offset
                });

                var myFont = new fabric.Text(text, {
                    fontFamily: fontName,
                    fontSize: fontsize,
                    top: 120 + offset
                });

                var image = self.getImageCanvas();
                image.add(noFont);
                image.add(myFont);

                var hasFailed = false;
                setTimeout(function () {
                    hasFailed = true;
                }, 5000);

                var doTest = function () {
                    if (hasFailed) {
                        onTimeoutCallback();
                        return;
                    }

                    image.renderAll();

                    if (noFont.width !== myFont.width) {
                        onLoadedCallback();
                        return;
                    }

                    setTimeout(doTest, 100);
                };

                doTest();
                //setTimeout(doTest, 100);
            };

            MemPuzzle.prototype.createPuzzle = function (onPuzzleComplete, makeOutsideFlat, difficulty, shouldRandomizePieces, shouldStackPieces, timeToShowCompletedPuzzle) {
                if (typeof onPuzzleComplete === "undefined") { onPuzzleComplete = function () {
                }; }
                if (typeof makeOutsideFlat === "undefined") { makeOutsideFlat = true; }
                if (typeof difficulty === "undefined") { difficulty = 0; }
                if (typeof shouldRandomizePieces === "undefined") { shouldRandomizePieces = false; }
                if (typeof shouldStackPieces === "undefined") { shouldStackPieces = true; }
                if (typeof timeToShowCompletedPuzzle === "undefined") { timeToShowCompletedPuzzle = 2000; }
                var self = this;
                var PADDING = MemPuzzle.PADDING;

                var canvas = self._canvas;

                var image = self._imageCanvas;

                // Clear Puzzle
                canvas.clear();

                // Set Puzzle complete
                self._onPuzzleComplete = onPuzzleComplete;

                // Calculate Image Scale
                var width = self._canvas.getWidth() - PADDING * 2;
                var height = self._canvas.getHeight() - PADDING * 2;

                var rWidth = width / image.getWidth();
                var rHeight = height / image.getHeight();

                var tRatio = Math.min(rWidth, rHeight);
                var sWidth = image.getWidth() * tRatio;
                var sHeight = image.getHeight() * tRatio;
                var sx = (width - sWidth) / 2 + PADDING;
                var sy = (height - sHeight) / 2 + PADDING;

                self._puzzleScale = tRatio;

                self._puzzleX = sx;
                self._puzzleY = sy;
                self._puzzleWidth = sWidth;
                self._puzzleHeight = sHeight;

                this.createPuzzleCompleted(self._imageData, timeToShowCompletedPuzzle);
                this.createPuzzleOutline();

                this.createPuzzlePieces(self._imageData, difficulty, makeOutsideFlat, function (pieces) {
                    self._pieces = pieces;

                    for (var i = 0; i < pieces.length; i++) {
                        var piece = pieces[i];
                        var pImage = piece.image;

                        pImage.scale(tRatio);

                        // BUG: IN FABRICJS - Sometimes some of the pieces are unclickable
                        pImage.perPixelTargetFind = true;
                        pImage.targetFindTolerance = 4;
                        pImage.hasBorders = false;
                        pImage.hasControls = false;

                        var x = sx;
                        var y = sy;

                        // Randomize
                        if (shouldRandomizePieces) {
                            var diff = 200;
                            x += diff * Math.random() - diff / 2;
                            y += diff * Math.random() - diff / 2;
                            //if (x < 0) { x = 0; }
                            //if (y < 0) { y = 0; }
                            //if (x > canvas.getWidth() - piece.width) { x = canvas.getWidth() - piece.width; }
                            //if (y > canvas.getHeight() - piece.height) { y = canvas.getHeight() - piece.height; }
                        }

                        pImage.setLeft(x);
                        pImage.setTop(y);
                        // Add to canvas
                        //canvas.add(piece);
                    }

                    // Randomize z index
                    var randomPieces = RandomOrder(pieces);

                    for (var i = 0; i < randomPieces.length; i++) {
                        canvas.add(randomPieces[i].image);
                    }

                    canvas.renderAll();

                    if (shouldStackPieces) {
                        self.stackPieces(true);
                    }
                });
            };

            MemPuzzle.prototype.createPuzzlePieces = function (imageData, difficulty, makeOutsideFlat, onCreatedPieces) {
                var self = this;

                var pieces = [];

                fabric.Image.fromURL(imageData, function (mainImage) {
                    var width = mainImage.width;
                    var height = mainImage.height;

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

                    var pWidth = width / hSideCount;
                    var pHeight = height / vSideCount;

                    var hEdges = [];
                    var vEdges = [];

                    for (var h = 0; h < hSideCount + 1; h++) {
                        hEdges.push([]);
                        vEdges.push([]);

                        for (var v = 0; v < vSideCount + 1; v++) {
                            var clipLeft = h * pWidth;
                            var clipTop = v * pHeight;
                            var clipWidth = pWidth;
                            var clipHeight = pHeight;

                            // Clip origin is at center of image
                            var left = clipLeft - width / 2;
                            var top = clipTop - height / 2;
                            var right = left + clipWidth;
                            var bottom = top + clipHeight;

                            var hIsInset = Math.random() > 0.5;
                            var vIsInset = Math.random() > 0.5;

                            var hIsOutside = (v === 0) || (v === vSideCount);
                            var vIsOutside = (h === 0) || (h === hSideCount);

                            if (!makeOutsideFlat) {
                                if (hIsOutside) {
                                    hIsOutside = false;
                                    hIsInset = (v === 0);
                                }

                                if (vIsOutside) {
                                    vIsOutside = false;
                                    vIsInset = (h !== 0);
                                }
                            }

                            if (!hIsOutside) {
                                hEdges[h][v] = self.createPuzzleEdge({ x: left, y: top }, { x: right, y: top }, hIsInset);
                            } else {
                                var s = { x: left, y: top };
                                var e = { x: right, y: top };
                                hEdges[h][v] = { start: s, end: e, points: [s, e] };
                            }

                            if (!vIsOutside) {
                                vEdges[h][v] = self.createPuzzleEdge({ x: left, y: top }, { x: left, y: bottom }, vIsInset);
                            } else {
                                var s = { x: left, y: top };
                                var e = { x: left, y: bottom };
                                vEdges[h][v] = { start: s, end: e, points: [s, e] };
                            }
                        }
                    }

                    // DEBUG
                    //self.drawEdges(hEdges);
                    //self.drawEdges(vEdges);
                    var pieces = [];

                    for (var h = 0; h < hSideCount; h++) {
                        for (var v = 0; v < vSideCount; v++) {
                            (function () {
                                var xInner = h;
                                var yInner = v;

                                fabric.Image.fromURL(imageData, function (img) {
                                    var piece = {
                                        image: img,
                                        x: xInner * pWidth,
                                        y: yInner * pHeight,
                                        width: pWidth,
                                        height: pHeight
                                    };

                                    piece.image.set({
                                        clipTo: function (ctx) {
                                            //// Clip origin is at center of image
                                            ////var left = pAny._clipLeft - width / 2;
                                            ////var top = pAny._clipTop - height / 2;
                                            ////var right = left + pAny._clipWidth;
                                            ////var bottom = top + pAny._clipHeight;
                                            ////var edges = [
                                            ////    self.createPuzzleEdge({ x: left, y: top }, { x: right, y: top }),
                                            ////    self.createPuzzleEdge({ x: right, y: top }, { x: right, y: bottom }),
                                            ////    self.createPuzzleEdge({ x: right, y: bottom }, { x: left, y: bottom }),
                                            ////    self.createPuzzleEdge({ x: left, y: bottom }, { x: left, y: top }),
                                            ////];
                                            var topEdge = hEdges[xInner][yInner];
                                            var rightEdge = vEdges[xInner + 1][yInner];
                                            var bottomEdge = hEdges[xInner][yInner + 1];
                                            var leftEdge = vEdges[xInner][yInner];

                                            var bEdgePoints = bottomEdge.points.map(function (p) {
                                                return { x: p.x, y: p.y - 2 };
                                                //return { x: p.x, y: p.y + 1 }
                                            }).reverse();

                                            bottomEdge = {
                                                points: bEdgePoints,
                                                start: bEdgePoints[0],
                                                end: bEdgePoints[bEdgePoints.length - 1]
                                            };

                                            var lEdgePoints = leftEdge.points.map(function (p) {
                                                return { x: p.x + 2, y: p.y };
                                                //return { x: p.x - 1, y: p.y }
                                            }).reverse();

                                            leftEdge = {
                                                points: lEdgePoints,
                                                start: lEdgePoints[0],
                                                end: lEdgePoints[lEdgePoints.length - 1]
                                            };

                                            var edges = [
                                                topEdge,
                                                rightEdge,
                                                bottomEdge,
                                                leftEdge
                                            ];

                                            ctx.beginPath();
                                            ctx.moveTo(edges[0].start.x, edges[0].start.y);

                                            for (var iSideNum = 0; iSideNum < edges.length; iSideNum++) {
                                                var edge = edges[iSideNum];

                                                MemPuzzle.curveThroughPoints(ctx, edge.points);
                                                // DEBUG
                                                //ctx.lineTo(edge.end.x, edge.end.y);
                                            }

                                            ctx.closePath();
                                        }
                                    });

                                    pieces.push(piece);

                                    if (pieces.length === hSideCount * vSideCount) {
                                        setTimeout(function () {
                                            onCreatedPieces(pieces);
                                        }, 10);
                                    }
                                });
                            })();
                        }
                    }
                });
            };

            MemPuzzle.prototype.createPuzzleCompleted = function (imageData, timeToShow) {
                var self = this;
                var canvas = self._canvas;

                var scale = self._puzzleScale;
                var x = self._puzzleX;
                var y = self._puzzleY;

                fabric.Image.fromURL(imageData, function (mainImage) {
                    mainImage.set({
                        scaleX: scale,
                        scaleY: scale,
                        left: x,
                        top: y,
                        hasBorders: false,
                        hasControls: false,
                        lockMovementX: true,
                        lockMovementY: true,
                        selectable: false
                    });

                    canvas.add(mainImage);

                    setTimeout(function () {
                        mainImage.remove();
                    }, timeToShow);
                });
            };

            MemPuzzle.prototype.createPuzzleOutline = function () {
                var self = this;
                var canvas = self._canvas;

                var thickness = 10;

                var outline = new fabric.Rect({
                    left: self._puzzleX - thickness,
                    top: self._puzzleY - thickness,
                    width: self._puzzleWidth + thickness,
                    height: self._puzzleHeight + thickness,
                    stroke: "rgb(100,100,255)",
                    strokeWidth: thickness,
                    fill: "rgba(0,0,0,0)",
                    hasBorders: false,
                    hasControls: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    selectable: false
                });

                canvas.add(outline);
            };

            MemPuzzle.prototype.drawEdges = function (edges) {
                var self = this;
                var ctx = self._canvas.getContext();

                for (var x = 0; x < edges.length; x++) {
                    for (var y = 0; y < edges[x].length; y++) {
                        var edge = edges[x][y];

                        ctx.moveTo(edge.start.x, edge.start.y);

                        // Curve through points
                        MemPuzzle.curveThroughPoints(ctx, edge.points);

                        ctx.stroke();
                    }
                }
            };

            MemPuzzle.prototype.drawShapeTest = function () {
                var self = this;
                var ctx = self._canvas.getContext();

                var left = 10;
                var top = 10;
                var right = 210;
                var bottom = 210;

                var edges = [
                    self.createPuzzleEdge({ x: left, y: top }, { x: right, y: top }),
                    self.createPuzzleEdge({ x: right, y: top }, { x: right, y: bottom }),
                    self.createPuzzleEdge({ x: right, y: bottom }, { x: left, y: bottom }),
                    self.createPuzzleEdge({ x: left, y: bottom }, { x: left, y: top })
                ];

                for (var iEdgeNum = 0; iEdgeNum < edges.length; iEdgeNum++) {
                    var edge = edges[iEdgeNum];

                    ctx.moveTo(edge.start.x, edge.start.y);

                    // Curve through points
                    MemPuzzle.curveThroughPoints(ctx, edge.points);

                    ctx.stroke();
                }
                //var ctx = self._canvas.getContext();
                //ctx.moveTo(side[0].x, side[0].y);
                //for (var iSide = 0; iSide < side.length; iSide++) {
                //    var s = side[iSide];
                //    ctx.lineTo(s.x, s.y);
                //}
                //ctx.stroke();
            };

            // Based on: http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
            MemPuzzle.curveThroughPoints = function (ctx, points) {
                for (var i = 0; i < points.length - 2; i++) {
                    var xc = (points[i].x + points[i + 1].x) / 2;
                    var yc = (points[i].y + points[i + 1].y) / 2;
                    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
                }

                // Last Point
                ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            };

            MemPuzzle.prototype.createPuzzleEdge = function (start, end, isInset) {
                if (typeof isInset === "undefined") { isInset = true; }
                // Hard code a basic shape
                var unitPoints = [
                    { x: 0, y: 0 },
                    { x: 0.2, y: 0 },
                    { x: 0.45, y: 0 },
                    { x: 0.45, y: 0.05 },
                    { x: 0.4, y: 0.1 },
                    { x: 0.4, y: 0.2 },
                    { x: 0.5, y: 0.25 },
                    { x: 0.6, y: 0.2 },
                    { x: 0.6, y: 0.1 },
                    { x: 0.55, y: 0.05 },
                    { x: 0.55, y: 0 },
                    { x: 0.8, y: 0 },
                    { x: 1, y: 0 }
                ];

                // Apply to vector and perp-vector
                var vect = {
                    x: end.x - start.x,
                    y: end.y - start.y
                };

                var pVect = {
                    x: -vect.y,
                    y: vect.x
                };

                // Maybe reverse pVect
                if (!isInset) {
                    pVect = {
                        x: -pVect.x,
                        y: -pVect.y
                    };
                }

                var finalPoints = [];

                for (var i = 0; i < unitPoints.length; i++) {
                    var u = unitPoints[i];

                    // Randomize
                    if (i !== 0 && i !== unitPoints.length - 1) {
                        var rMax = 0.04;
                        var rMaxHalf = rMax * 0.5;

                        var xRand = Math.random() * rMax - rMaxHalf;
                        var yRand = Math.random() * rMax - rMaxHalf;
                        u = { x: u.x + xRand, y: u.y + yRand };
                    }

                    // Make final point
                    finalPoints.push({
                        x: Math.floor(start.x + (vect.x * u.x) + (pVect.x * u.y)),
                        y: Math.floor(start.y + (vect.y * u.x) + (pVect.y * u.y))
                    });
                }

                return { points: finalPoints, start: start, end: end };
            };
            MemPuzzle.STACK_X = 30;
            MemPuzzle.STACK_Y = 30;
            MemPuzzle.LOCKRADIUS = 20;
            MemPuzzle.PADDING = 100;
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
    })(TOLD.MemPuzzle || (TOLD.MemPuzzle = {}));
    var MemPuzzle = TOLD.MemPuzzle;
})(TOLD || (TOLD = {}));
