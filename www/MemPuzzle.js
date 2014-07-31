var TOLD;
(function (TOLD) {
    (function (_MemPuzzle) {
        var MemPuzzle = (function () {
            function MemPuzzle(canvasId, imgUrl) {
                var _this = this;
                this.canvas = null;
                this.context = null;
                this.image = null;
                this.canvas = document.getElementById(canvasId);
                this.context = this.canvas.getContext('2d');

                // Load image
                this.image = new Image();
                this.image.src = imgUrl;

                // Let the image load
                this.image.onload = function () {
                    _this.createPuzzle();
                };
            }
            MemPuzzle.prototype.createPuzzle = function () {
                var image = this.image;
                var context = this.context;

                var width = this.canvas.width;
                var height = this.canvas.height;

                // Scale image
                var rWidth = width / image.width;
                var rHeight = height / image.height;

                var tRatio = Math.min(rWidth, rHeight);
                var sWidth = image.width * tRatio;
                var sHeight = image.height * tRatio;
                var sx = (width - sWidth) / 2;
                var sy = (height - sHeight) / 2;

                var sImage = document.createElement("canvas");
                var sContext = sImage.getContext('2d');
                sImage.width = sWidth;
                sImage.height = sHeight;
                sContext.drawImage(image, 0, 0, sWidth, sHeight);

                // DEBUG: Draw image
                //context.drawImage(image, 0, 0);
                //context.drawImage(sImage, 0, 0);
                //context.drawImage(sImage, sx, sy);
                //return;
                // Create puzzle pieces
                var pieces = this.createPuzzlePieces(sImage, 0);

                for (var i = 0; i < pieces.length; i++) {
                    var piece = pieces[i];
                    var cvsPiece = piece;

                    var diff = 100;
                    var x = sx + diff * Math.random() - diff / 2;
                    var y = sy + diff * Math.random() - diff / 2;

                    context.drawImage(cvsPiece, x, y);
                }
            };

            MemPuzzle.prototype.createPuzzlePieces = function (image, difficulty) {
                var width = image.width;
                var height = image.height;

                // TEMP: Create a n*n puzzle
                var pSide = 5;

                var pieces = [];

                var rWidth = width / pSide;
                var rHeight = height / pSide;

                for (var x = 0; x < pSide; x++) {
                    for (var y = 0; y < pSide; y++) {
                        var i = x * pSide + y;

                        var piece = document.createElement("canvas");
                        var pContext = piece.getContext('2d');
                        piece.width = width;
                        piece.height = height;

                        pContext.rect(x * rWidth, y * rHeight, rWidth, rHeight);
                        pContext.clip();
                        pContext.drawImage(image, 0, 0);

                        pieces.push(piece);
                    }
                }

                return pieces;
            };
            return MemPuzzle;
        })();
        _MemPuzzle.MemPuzzle = MemPuzzle;
    })(TOLD.MemPuzzle || (TOLD.MemPuzzle = {}));
    var MemPuzzle = TOLD.MemPuzzle;
})(TOLD || (TOLD = {}));
