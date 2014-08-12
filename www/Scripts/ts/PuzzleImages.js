///<reference path="ImageSource.ts"/>
var Told;
(function (Told) {
    (function (MemPuzzle) {
        var PuzzleImages = (function () {
            function PuzzleImages(columns, rows) {
                var self = this;

                self.whole = {
                    canvas: Told.MemPuzzle.WorkingCanvas.getWorkingCanvas(),
                    width: null,
                    height: null,
                    targetX: 0,
                    targetY: 0,
                    pRatioLeft: 0,
                    pRatioTop: 0,
                    pRatioRight: 1,
                    pRatioBottom: 1,
                    topEdge: null,
                    rightEdge: null,
                    bottomEdge: null,
                    leftEdge: null
                };

                self.pieces = PuzzleImages.createPieces(columns, rows);
            }
            PuzzleImages.createPieces = function (columns, rows) {
                throw new Error("Not Implemented");
                // Create pieces
                // Create piece canvases
                // Create piece positions
                // Create edges
            };

            PuzzleImages.prototype.draw = function (imageSource, targetWidth, targetHeight) {
                var self = this;

                // Draw whole puzzle from scaled image source
                PuzzleImages.drawWhole(self.whole, imageSource, targetWidth, targetHeight);

                // Draw pieces
                PuzzleImages.drawPieces(self.pieces, self.whole);
            };

            PuzzleImages.drawWhole = function (whole, imageSource, targetWidth, targetHeight) {
                // Clear canvas
                //whole.canvas.canvasElement
                // Set canvas size
                // Draw image source to canvas as scaled image
            };

            PuzzleImages.drawPieces = function (pieces, whole) {
                // Get working canvas
                // Set canvas size
                // For each piece (including whole)
                // Clear canvas
                // Set clip
                // Draw whole puzzle (in clip)
                // Calculate bounds
                // Set piece canvas size
                // Clear pieces canvas
                // Draw working canvas to pieces canvas
                // Record bounds as size and target coordinates
            };
            return PuzzleImages;
        })();
        MemPuzzle.PuzzleImages = PuzzleImages;
    })(Told.MemPuzzle || (Told.MemPuzzle = {}));
    var MemPuzzle = Told.MemPuzzle;
})(Told || (Told = {}));
