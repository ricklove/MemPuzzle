﻿///<reference path="Scripts/typings/fabricjs/fabricjs.d.ts"/>

module TOLD.MemPuzzle {

    export class MemPuzzle {

        private _canvas: fabric.ICanvas = null;
        private _image: fabric.IImage = null;
        private _imageUrl: string = null;

        private _pieces: fabric.IImage[] = null;

        constructor(canvasId: string, imgUrl: string) {
            var self = this;

            self._imageUrl = imgUrl;

            var canvas = self._canvas = new fabric.Canvas(canvasId, {
                hoverCursor: 'pointer',
                selection: false
            });

            canvas.on({
                'object:moving': function (e: any) {
                    e.target.opacity = 0.5;
                },
                'object:modified': function (e: any) {
                    e.target.opacity = 1;
                }
            });

            fabric.Image.fromURL(imgUrl, function (img) {
                self._image = img;
                self.createPuzzle();
            });
        }

        createPuzzle() {
            var self = this;

            var canvas = self._canvas;

            var image = self._image;
            var width = self._canvas.getWidth();
            var height = self._canvas.getHeight();

            // Scale image
            var rWidth = width / image.width;
            var rHeight = height / image.height;

            var tRatio = Math.min(rWidth, rHeight);
            var sWidth = image.width * tRatio;
            var sHeight = image.height * tRatio;
            var sx = (width - sWidth) / 2;
            var sy = (height - sHeight) / 2;

            image.scale(tRatio);
            image.hasBorders = false;
            image.hasControls = false;

            // DEBUG: Draw Image
            //canvas.add(image);

            this.createPuzzlePieces(self._imageUrl, 0, (pieces) => {

                self._pieces = pieces;

                // Draw pieces
                for (var i = 0; i < pieces.length; i++) {
                    var piece = pieces[i];
                    canvas.add(piece);

                    piece.scale(tRatio);

                    piece.perPixelTargetFind = true;
                    (<any>piece).targetFindTolerance = 4;
                    piece.hasBorders = false;
                    piece.hasControls = false;

                    // Randomize
                    var diff = 100;
                    var x = sx + diff * Math.random() - diff / 2;
                    var y = sy + diff * Math.random() - diff / 2;

                    piece.setLeft(x);
                    piece.setTop(y);

                }

                canvas.renderAll();
            });

        }

        createPuzzlePieces(imageUrl: string, difficulty: number, onCreatedPieces: (pieces: fabric.IImage[]) => void) {
            var self = this;

            var pieces = <fabric.IImage[]>[];

            fabric.Image.fromURL(imageUrl, function (mainImage) {

                var width = mainImage.width;
                var height = mainImage.height;

                // TEMP: Create a n*n puzzle
                var pSide = 3;

                var pieces = <fabric.IImage[]>[];

                var pWidth = width / pSide;
                var pHeight = height / pSide;

                for (var x = 0; x < pSide; x++) {
                    for (var y = 0; y < pSide; y++) {

                        (function () {
                            var xInner = x;
                            var yInner = y;

                            fabric.Image.fromURL(self._imageUrl, function (img) {

                                var piece = img;
                                pieces.push(piece);

                                var pAny = <any>piece;

                                pAny._clipLeft = xInner * pWidth;
                                pAny._clipTop = yInner * pHeight;
                                pAny._clipWidth = pWidth;
                                pAny._clipHeight = pHeight;

                                piece.set({
                                    clipTo: (ctx: CanvasRenderingContext2D) => {
                                        // Clip origin is at center of image
                                        ctx.rect(
                                            pAny._clipLeft - width / 2,
                                            pAny._clipTop - height / 2,
                                            pAny._clipWidth,
                                            pAny._clipHeight);
                                    }
                                });

                                if (pieces.length === pSide * pSide) {
                                    onCreatedPieces(pieces);
                                }
                            });
                        })();

                    }
                }

            });
        }

    }

}