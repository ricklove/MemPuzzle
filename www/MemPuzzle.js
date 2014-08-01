///<reference path="Scripts/typings/fabricjs/fabricjs.d.ts"/>
var TOLD;
(function (TOLD) {
    (function (_MemPuzzle) {
        var MemPuzzle = (function () {
            function MemPuzzle(canvasId) {
                this._canvas = null;
                this._image = null;
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
            MemPuzzle.prototype.createPuzzleFromImage = function (imgUrl) {
                var self = this;

                fabric.Image.fromURL(imgUrl, function (img) {
                    var image = self._image;

                    if (image === null) {
                        image = self._image = document.createElement("canvas");
                    }

                    image.width = img.width;
                    image.height = img.height;

                    var context = image.getContext('2d');
                    context.clearRect(0, 0, image.width, image.height);
                    context.drawImage(img.getElement(), 0, 0, image.width, image.height);

                    self._imageData = image.toDataURL();

                    self.createPuzzle();
                });
            };

            MemPuzzle.prototype.createPuzzle = function () {
                var self = this;

                var canvas = self._canvas;

                var image = self._image;
                var width = self._canvas.getWidth();
                var height = self._canvas.getHeight();

                // Calculate Image Scale
                var rWidth = width / image.width;
                var rHeight = height / image.height;

                var tRatio = Math.min(rWidth, rHeight);
                var sWidth = image.width * tRatio;
                var sHeight = image.height * tRatio;
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

                        // Randomize
                        var diff = 100;
                        var x = sx + diff * Math.random() - diff / 2;
                        var y = sy + diff * Math.random() - diff / 2;

                        piece.setLeft(x);
                        piece.setTop(y);

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

                    // TEMP: Create a n*n puzzle
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
                                            ctx.rect(pAny._clipLeft - width / 2, pAny._clipTop - height / 2, pAny._clipWidth, pAny._clipHeight);
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
            return MemPuzzle;
        })();
        _MemPuzzle.MemPuzzle = MemPuzzle;
    })(TOLD.MemPuzzle || (TOLD.MemPuzzle = {}));
    var MemPuzzle = TOLD.MemPuzzle;
})(TOLD || (TOLD = {}));
