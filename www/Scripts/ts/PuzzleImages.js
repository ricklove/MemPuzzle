///<reference path="ImageSource.ts"/>
var Told;
(function (Told) {
    (function (MemPuzzle) {
        var PuzzleImages = (function () {
            function PuzzleImages() {
            }
            PuzzleImages.createPieces = function (columns, rows) {
                // Create pieces
                // Create piece canvases
                // Create piece positions
                // Create edges
            };

            PuzzleImages.drawWhole = function (imageSource, targetWidth, targetHeight) {
                // Draw whole puzzle from scaled image source
            };

            PuzzleImages.drawPieces = function (whole) {
                // Get working canvas
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
