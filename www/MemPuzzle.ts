
module TOLD.MemPuzzle {

    export class MemPuzzle {

        private canvas: HTMLCanvasElement = null;
        private context: CanvasRenderingContext2D = null;
        private image: HTMLImageElement = null;


        constructor(canvasId, imgUrl) {
            this.canvas = <HTMLCanvasElement> document.getElementById(canvasId);
            this.context = <CanvasRenderingContext2D> this.canvas.getContext('2d');

            // Load image
            this.image = new Image();
            this.image.src = imgUrl;

            // Let the image load
            this.image.onload = () => {
                this.createPuzzle();
            };
        }

        createPuzzle() {
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

            var sImage = <HTMLCanvasElement> document.createElement("canvas");
            var sContext = <CanvasRenderingContext2D> sImage.getContext('2d');
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

            // Draw pieces
            for (var i = 0; i < pieces.length; i++) {
                var piece = pieces[i];
                var cvsPiece = piece;

                var diff = 100;
                var x = sx + diff * Math.random() - diff / 2;
                var y = sy + diff * Math.random() - diff / 2;

                context.drawImage(cvsPiece, x, y);
            }
        }

        createPuzzlePieces(image: HTMLCanvasElement, difficulty: number): HTMLCanvasElement[] {
            var width = image.width;
            var height = image.height;

            // TEMP: Create a n*n puzzle
            var pSide = 5;

            var pieces = <HTMLCanvasElement[]>[];

            var rWidth = width / pSide;
            var rHeight = height / pSide;

            for (var x = 0; x < pSide; x++) {
                for (var y = 0; y < pSide; y++) {
                    var i = x * pSide + y;

                    var piece = <HTMLCanvasElement> document.createElement("canvas");
                    var pContext = <CanvasRenderingContext2D> piece.getContext('2d');
                    piece.width = width;
                    piece.height = height;

                    pContext.rect(x * rWidth, y * rHeight, rWidth, rHeight);
                    pContext.clip();
                    pContext.drawImage(image, 0, 0);

                    pieces.push(piece);
                }
            }

            return pieces;
        }

    }

}