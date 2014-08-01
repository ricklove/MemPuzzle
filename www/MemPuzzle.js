﻿///<reference path="Scripts/typings/fabricjs/fabricjs.d.ts"/>
var TOLD;
(function (TOLD) {
    (function (_MemPuzzle) {
        var MemPuzzle = (function () {
            function MemPuzzle(canvasId) {
                this._canvas = null;
                //private _imageCanvasElement: HTMLCanvasElement = null;
                this._imageCanvas = null;
                this._imageData = null;
                this._offsetX = 0;
                this._offsetY = 0;
                this._pieces = null;
                var self = this;

                var canvas = self._canvas = new fabric.Canvas(canvasId, {
                    hoverCursor: 'pointer',
                    selection: false
                });

                canvas.backgroundColor = "lightgrey";

                canvas.on({
                    'object:moving': function (e) {
                        var target = e.target;
                        target.opacity = 0.5;

                        // Snap to target
                        var nearness = Math.abs(self._offsetX - target.left) + Math.abs(self._offsetY - target.top);
                        if (nearness < 20) {
                            target.setLeft(self._offsetX);
                            target.setTop(self._offsetY);
                        }
                    },
                    'object:modified': function (e) {
                        var target = e.target;

                        target.opacity = 1;
                    }
                });
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
            MemPuzzle.prototype.createPuzzleFromText = function (text, shouldUseSans) {
                if (typeof shouldUseSans === "undefined") { shouldUseSans = true; }
                var self = this;

                var image = self._imageCanvas;

                if (image === null) {
                    var element = document.createElement("canvas");
                    element.setAttribute('id', '_temp_canvas');
                    image = self._imageCanvas = new fabric.Canvas('_temp_canvas');
                    image.renderOnAddition = false;
                }

                //image.setWidth(self._canvas.getWidth());
                //image.setHeight(self._canvas.getHeight());
                image._objects = [];

                //image.clear();
                // Draw Text
                var textPadding = 10;

                var textObject = new fabric.Text(text, {
                    fontFamily: shouldUseSans ? "Arial" : "Georgia",
                    fontSize: (self._canvas.getHeight()),
                    //lineHeight: (self._canvas.getHeight() * 0.8), // BUG
                    top: -self._canvas.getHeight() * 0.25 + textPadding,
                    left: textPadding
                });
                image.add(textObject);

                // Set to fit text
                image.backgroundColor = "white";
                image.setWidth(textObject.width + textPadding * 2);
                image.setHeight(textObject.height * 0.8 + textPadding * 2);

                image.renderAll();

                // Save Data
                self._imageData = image.toDataURL("png");

                self.createPuzzle();
            };

            MemPuzzle.prototype.createPuzzle = function (makeOutsideFlat, difficulty, randomize) {
                if (typeof makeOutsideFlat === "undefined") { makeOutsideFlat = false; }
                if (typeof difficulty === "undefined") { difficulty = 0; }
                if (typeof randomize === "undefined") { randomize = false; }
                var self = this;

                var canvas = self._canvas;

                var image = self._imageCanvas;

                // Calculate Image Scale
                var padding = 10;

                var width = self._canvas.getWidth() - padding * 2;
                var height = self._canvas.getHeight() - padding * 2;

                var rWidth = width / image.getWidth();
                var rHeight = height / image.getHeight();

                var tRatio = Math.min(rWidth, rHeight);
                var sWidth = image.getWidth() * tRatio;
                var sHeight = image.getHeight() * tRatio;
                var sx = (width - sWidth) / 2 + padding;
                var sy = (height - sHeight) / 2 + padding;

                self._offsetX = sx;
                self._offsetY = sy;

                this.createPuzzlePieces(self._imageData, difficulty, makeOutsideFlat, function (pieces) {
                    self._pieces = pieces;

                    for (var i = 0; i < pieces.length; i++) {
                        var piece = pieces[i];

                        piece.scale(tRatio);

                        // BUG: IN FABRICJS - Sometimes some of the pieces are unclickable
                        piece.perPixelTargetFind = true;
                        piece.targetFindTolerance = 4;
                        piece.hasBorders = false;
                        piece.hasControls = false;

                        var x = sx;
                        var y = sy;

                        // Randomize
                        if (randomize) {
                            var diff = 100;
                            x += diff * Math.random() - diff / 2;
                            y += diff * Math.random() - diff / 2;
                        }

                        piece.setLeft(x);
                        piece.setTop(y);

                        // Add pieces
                        canvas.add(piece);
                    }

                    canvas.renderAll();
                });
            };

            MemPuzzle.prototype.createPuzzlePieces = function (imageData, difficulty, makeOutsideFlat, onCreatedPieces) {
                var self = this;

                var pieces = [];

                fabric.Image.fromURL(imageData, function (mainImage) {
                    var width = mainImage.width;
                    var height = mainImage.height;

                    // Create an n*n puzzle
                    var pSideCount = 3;
                    var pWidth = width / pSideCount;
                    var pHeight = height / pSideCount;

                    var hEdges = [];
                    var vEdges = [];

                    for (var x = 0; x < pSideCount + 1; x++) {
                        hEdges.push([]);
                        vEdges.push([]);

                        for (var y = 0; y < pSideCount + 1; y++) {
                            var clipLeft = x * pWidth;
                            var clipTop = y * pHeight;
                            var clipWidth = pWidth;
                            var clipHeight = pHeight;

                            // Clip origin is at center of image
                            var left = clipLeft - width / 2;
                            var top = clipTop - height / 2;
                            var right = left + clipWidth;
                            var bottom = top + clipHeight;

                            var hIsInset = Math.random() > 0.5;
                            var vIsInset = Math.random() > 0.5;

                            var hIsOutside = (y === 0) || (y === pSideCount);
                            var vIsOutside = (x === 0) || (x === pSideCount);

                            if (!makeOutsideFlat) {
                                if (hIsOutside) {
                                    hIsOutside = false;
                                    hIsInset = (y === 0);
                                }

                                if (vIsOutside) {
                                    vIsOutside = false;
                                    vIsInset = (x !== 0);
                                }
                            }

                            if (!hIsOutside) {
                                hEdges[x][y] = self.createPuzzleEdge({ x: left, y: top }, { x: right, y: top }, hIsInset);
                            } else {
                                var s = { x: left, y: top };
                                var e = { x: right, y: top };
                                hEdges[x][y] = { start: s, end: e, points: [s, e] };
                            }

                            if (!vIsOutside) {
                                vEdges[x][y] = self.createPuzzleEdge({ x: left, y: top }, { x: left, y: bottom }, vIsInset);
                            } else {
                                var s = { x: left, y: top };
                                var e = { x: left, y: bottom };
                                vEdges[x][y] = { start: s, end: e, points: [s, e] };
                            }
                        }
                    }

                    // DEBUG
                    //self.drawEdges(hEdges);
                    //self.drawEdges(vEdges);
                    var pieces = [];

                    for (var x = 0; x < pSideCount; x++) {
                        for (var y = 0; y < pSideCount; y++) {
                            (function () {
                                var xInner = x;
                                var yInner = y;

                                fabric.Image.fromURL(imageData, function (img) {
                                    var piece = img;

                                    ////var pAny = <any>piece;
                                    ////pAny._clipLeft = xInner * pWidth;
                                    ////pAny._clipTop = yInner * pHeight;
                                    ////pAny._clipWidth = pWidth;
                                    ////pAny._clipHeight = pHeight;
                                    piece.set({
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

                                    if (pieces.length === pSideCount * pSideCount) {
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
            return MemPuzzle;
        })();
        _MemPuzzle.MemPuzzle = MemPuzzle;
    })(TOLD.MemPuzzle || (TOLD.MemPuzzle = {}));
    var MemPuzzle = TOLD.MemPuzzle;
})(TOLD || (TOLD = {}));
