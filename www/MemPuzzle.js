///<reference path="Scripts/typings/fabricjs/fabricjs.d.ts"/>
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
            MemPuzzle.prototype.createPuzzleFromText = function (text) {
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
                var textObject = new fabric.Text(text, {
                    fontSize: (self._canvas.getHeight()),
                    //lineHeight: (self._canvas.getHeight() * 0.8), // BUG
                    top: -self._canvas.getHeight() * 0.25
                });
                image.add(textObject);

                // Set to fit text
                image.backgroundColor = "lightgray";
                image.setWidth(textObject.width);
                image.setHeight(textObject.height * 0.8);

                image.renderAll();

                // Save Data
                self._imageData = image.toDataURL("png");

                self.createPuzzle();
            };

            MemPuzzle.prototype.createPuzzle = function () {
                var self = this;

                var canvas = self._canvas;

                var image = self._imageCanvas;
                var width = self._canvas.getWidth();
                var height = self._canvas.getHeight();

                // Calculate Image Scale
                var rWidth = width / image.getWidth();
                var rHeight = height / image.getHeight();

                var tRatio = Math.min(rWidth, rHeight);
                var sWidth = image.getWidth() * tRatio;
                var sHeight = image.getHeight() * tRatio;
                var sx = (width - sWidth) / 2;
                var sy = (height - sHeight) / 2;

                self._offsetX = sx;
                self._offsetY = sy;

                this.createPuzzlePieces(self._imageData, 0, function (pieces) {
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
                        //var diff = 100;
                        //x += diff * Math.random() - diff / 2;
                        //y += diff * Math.random() - diff / 2;
                        piece.setLeft(x);
                        piece.setTop(y);

                        // Add pieces
                        canvas.add(piece);
                    }

                    canvas.renderAll();
                });
            };

            MemPuzzle.prototype.createPuzzlePieces = function (imageData, difficulty, onCreatedPieces) {
                var self = this;

                var pieces = [];

                fabric.Image.fromURL(imageData, function (mainImage) {
                    var width = mainImage.width;
                    var height = mainImage.height;

                    // Create a n*n puzzle
                    var pSide = 3;

                    var pieces = [];

                    var pWidth = width / pSide;
                    var pHeight = height / pSide;

                    for (var x = 0; x < pSide; x++) {
                        for (var y = 0; y < pSide; y++) {
                            (function () {
                                var xInner = x;
                                var yInner = y;

                                fabric.Image.fromURL(imageData, function (img) {
                                    var piece = img;

                                    var pAny = piece;

                                    pAny._clipLeft = xInner * pWidth;
                                    pAny._clipTop = yInner * pHeight;
                                    pAny._clipWidth = pWidth;
                                    pAny._clipHeight = pHeight;

                                    piece.set({
                                        clipTo: function (ctx) {
                                            // Clip origin is at center of image
                                            //ctx.rect(
                                            //    pAny._clipLeft - width / 2,
                                            //    pAny._clipTop - height / 2,
                                            //    pAny._clipWidth,
                                            //    pAny._clipHeight);
                                            ctx.beginPath();

                                            var left = pAny._clipLeft - width / 2;
                                            var top = pAny._clipTop - height / 2;
                                            var right = left + pAny._clipWidth;
                                            var bottom = top + pAny._clipHeight;

                                            ctx.moveTo(left, top);

                                            //ctx.lineTo(right, top);
                                            //ctx.lineTo(right, bottom);
                                            //ctx.lineTo(left, bottom);
                                            //ctx.lineTo(left, top);
                                            var sides = [
                                                self.createPuzzleShape({ x: left, y: top }, { x: right, y: top }),
                                                self.createPuzzleShape({ x: right, y: top }, { x: right, y: bottom }),
                                                self.createPuzzleShape({ x: right, y: bottom }, { x: left, y: bottom }),
                                                self.createPuzzleShape({ x: left, y: bottom }, { x: left, y: top })
                                            ];

                                            for (var iSideNum = 0; iSideNum < sides.length; iSideNum++) {
                                                var side = sides[iSideNum];

                                                for (var iSide = 0; iSide < side.length; iSide++) {
                                                    var s = side[iSide];
                                                    ctx.lineTo(s.x, s.y);
                                                }
                                            }

                                            //ctx.lineTo(right, top);
                                            //ctx.lineTo(right, bottom);
                                            //ctx.lineTo(left, bottom);
                                            //ctx.lineTo(left, top);
                                            ctx.closePath();
                                        }
                                    });

                                    pieces.push(piece);

                                    if (pieces.length === pSide * pSide) {
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

            MemPuzzle.prototype.drawShapeTest = function () {
                var self = this;
                var ctx = self._canvas.getContext();

                var left = 10;
                var top = 10;
                var right = 210;
                var bottom = 210;

                var sides = [
                    self.createPuzzleShape({ x: left, y: top }, { x: right, y: top }),
                    self.createPuzzleShape({ x: right, y: top }, { x: right, y: bottom }),
                    self.createPuzzleShape({ x: right, y: bottom }, { x: left, y: bottom }),
                    self.createPuzzleShape({ x: left, y: bottom }, { x: left, y: top })
                ];

                for (var iSideNum = 0; iSideNum < sides.length; iSideNum++) {
                    var side = sides[iSideNum];

                    ctx.moveTo(side[0].x, side[0].y);

                    // Line through points
                    //for (var iSide = 0; iSide < side.length; iSide++) {
                    //    var s = side[iSide];
                    //    ctx.lineTo(s.x, s.y);
                    //}
                    // Curve through points
                    MemPuzzle.curveThroughPoints(ctx, side);

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

            MemPuzzle.prototype.createPuzzleShape = function (start, end) {
                // Hard code a basic shape
                var unitPoints = [
                    { x: 0, y: 0 },
                    { x: 0.2, y: 0 },
                    { x: 0.45, y: 0 },
                    { x: 0.45, y: 0.05 },
                    { x: 0.4, y: 0.05 },
                    { x: 0.4, y: 0.15 },
                    { x: 0.5, y: 0.2 },
                    { x: 0.6, y: 0.15 },
                    { x: 0.6, y: 0.05 },
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
                var reverse = false;
                if (reverse) {
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
                        x: start.x + (vect.x * u.x) + (pVect.x * u.y),
                        y: start.y + (vect.y * u.x) + (pVect.y * u.y)
                    });
                }

                return finalPoints;
            };
            return MemPuzzle;
        })();
        _MemPuzzle.MemPuzzle = MemPuzzle;
    })(TOLD.MemPuzzle || (TOLD.MemPuzzle = {}));
    var MemPuzzle = TOLD.MemPuzzle;
})(TOLD || (TOLD = {}));
