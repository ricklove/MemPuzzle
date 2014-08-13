///<reference path="ImageSource.ts"/>
var Told;
(function (Told) {
    (function (MemPuzzle) {
        var PuzzleImages = (function () {
            function PuzzleImages(columns, rows, widthOverHeightRatio) {
                var self = this;

                self.whole = {
                    id: "whole",
                    canvas: Told.MemPuzzle.WorkingCanvas.getWorkingCanvas(),
                    width: null,
                    height: null,
                    targetX: 0,
                    targetY: 0,
                    pRatioLeft: 0,
                    pRatioTop: 0,
                    pRatioRight: 1,
                    pRatioBottom: 1,
                    leftEdge: null,
                    topEdge: null,
                    rightEdge: null,
                    bottomEdge: null
                };

                self.whole.canvas.canvasElement.setAttribute("id", self.whole.id);

                self.pieces = PuzzleImages.createPieces(columns, rows, widthOverHeightRatio);
            }
            PuzzleImages.createPieces = function (columns, rows, widthOverHeightRatio) {
                var pieces = [];

                // Create edges
                var edges = PuzzleImages.createEdges(columns, rows, widthOverHeightRatio);

                // Create pieces
                var pRatioWidth = 1.0 / columns;
                var pRatioHeight = 1.0 / rows;

                for (var iCol = 0; iCol < columns; iCol++) {
                    for (var iRow = 0; iRow < rows; iRow++) {
                        var p = {
                            id: "piece_" + iCol + "_" + iRow,
                            // Create piece canvases
                            canvas: Told.MemPuzzle.WorkingCanvas.getWorkingCanvas(),
                            width: null,
                            height: null,
                            targetX: null,
                            targetY: null,
                            // Create piece positions
                            pRatioLeft: iCol * pRatioWidth,
                            pRatioTop: iRow * pRatioHeight,
                            pRatioRight: (iCol + 1) * pRatioWidth,
                            pRatioBottom: (iRow + 1) * pRatioHeight,
                            // Select edges
                            leftEdge: edges.verticalEdges[iCol][iRow],
                            topEdge: edges.horizontalEdges[iCol][iRow],
                            rightEdge: edges.verticalEdges[iCol + 1][iRow],
                            bottomEdge: edges.horizontalEdges[iCol][iRow + 1]
                        };

                        p.canvas.canvasElement.setAttribute("id", p.id);

                        pieces.push(p);
                    }
                }

                return pieces;
            };

            PuzzleImages.prototype.draw = function (imageSource, targetWidth, targetHeight) {
                var self = this;

                // Draw whole puzzle from scaled image source
                PuzzleImages.drawWhole(self.whole, imageSource, targetWidth, targetHeight);

                // Draw pieces
                PuzzleImages.drawPieces(self.pieces, self.whole);
            };

            PuzzleImages.drawWhole = function (whole, imageSource, targetWidth, targetHeight) {
                var canvas = whole.canvas.canvasElement;
                var ctx = whole.canvas.getContext();

                // Set canvas size
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Clear canvas
                ctx.clearRect(0, 0, targetWidth, targetHeight);

                // Draw image source to canvas as scaled image
                ctx.drawImage(imageSource.imageOrCanvas, 0, 0, targetWidth, targetHeight);

                // Copy properties
                whole.width = targetWidth;
                whole.height = targetHeight;
                whole.targetX = 0;
                whole.targetY = 0;
            };

            PuzzleImages.drawPieces = function (pieces, whole) {
                var DEBUG = false;

                // Get working canvas
                var wCanvas = Told.MemPuzzle.WorkingCanvas.getWorkingCanvas();
                var ctx = wCanvas.getContext();

                // Set canvas size
                var width = wCanvas.canvasElement.width = whole.width;
                var height = wCanvas.canvasElement.height = whole.height;

                for (var i = 0; i < pieces.length; i++) {
                    // DEBUG
                    var doWork = function (iInner) {
                        var piece = pieces[iInner];

                        var left = piece.pRatioLeft * width;
                        var right = piece.pRatioRight * width;
                        var top = piece.pRatioTop * height;
                        var bottom = piece.pRatioBottom * height;

                        left = Math.ceil(left);
                        right = Math.ceil(right);
                        top = Math.ceil(top);
                        bottom = Math.ceil(bottom);

                        // Clear canvas
                        ctx.clearRect(0, 0, width, height);

                        // DEBUG
                        if (DEBUG) {
                            ctx.fillStyle = "blue";
                            ctx.fillRect(0, 0, width, height);
                            ctx.strokeStyle = "red";
                            ctx.strokeRect(0, 0, width, height);
                        }

                        // TODO: Use edges as clip
                        // Set clip
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(left, top);
                        ctx.lineTo(right, top);
                        ctx.lineTo(right, bottom);
                        ctx.lineTo(left, bottom);

                        //ctx.lineTo(left, top);
                        ctx.closePath();
                        ctx.clip();

                        // Draw whole puzzle (in clip)
                        ctx.drawImage(whole.canvas.canvasElement, 0, 0, width, height);
                        ctx.restore();

                        // TODO: Use edges to calculate bounds
                        // Calculate bounds
                        var bLeft = left;
                        var bTop = top;
                        var bRight = right;
                        var bBottom = bottom;

                        var bWidth = bRight - bLeft;
                        var bHeight = bBottom - bTop;

                        // Set piece canvas size
                        var pCanvas = piece.canvas.canvasElement;
                        var pCtx = piece.canvas.getContext();

                        pCanvas.width = bWidth;
                        pCanvas.height = bHeight;

                        // Clear pieces canvas
                        pCtx.clearRect(0, 0, bWidth, bHeight);

                        // DEBUG
                        if (DEBUG) {
                            pCtx.fillStyle = "lime";
                            pCtx.fillRect(0, 0, bWidth, bHeight);
                            pCtx.strokeStyle = "red";
                            pCtx.strokeRect(0, 0, bWidth, bHeight);
                        }

                        // Draw working canvas to pieces canvas
                        pCtx.drawImage(wCanvas.canvasElement, -bLeft, -bTop, width, height);

                        // Record bounds as size and target coordinates
                        piece.width = bWidth;
                        piece.height = bHeight;
                        piece.targetX = bLeft;
                        piece.targetY = bTop;
                    };

                    var doWorkInner = (function () {
                        var i2 = i;
                        return function () {
                            doWork(i2);
                        };
                    })();

                    if (DEBUG) {
                        setTimeout(doWorkInner, 1000 * i);
                    } else {
                        doWorkInner();
                    }
                }

                wCanvas.release();
            };

            PuzzleImages.createEdges = function (columns, rows, widthOverHeightRatio, makeOutsideFlat) {
                if (typeof makeOutsideFlat === "undefined") { makeOutsideFlat = true; }
                var hSideCount = columns;
                var vSideCount = rows;
                var pWidth = 1;
                var pHeight = 1;

                var hEdges = [];
                var vEdges = [];

                for (var h = 0; h < hSideCount + 1; h++) {
                    hEdges.push([]);
                    vEdges.push([]);

                    for (var v = 0; v < vSideCount + 1; v++) {
                        var hCircleReductionRatio = 1 / widthOverHeightRatio;
                        var vCircleReductionRatio = widthOverHeightRatio;

                        hCircleReductionRatio = Math.max(1, hCircleReductionRatio);
                        vCircleReductionRatio = Math.max(1, vCircleReductionRatio);

                        var hIsInset = Math.random() > 0.5;
                        var vIsInset = Math.random() > 0.5;

                        var hIsStraight = (v === 0) || (v === vSideCount);
                        var vIsStraight = (h === 0) || (h === hSideCount);

                        if (!makeOutsideFlat) {
                            if (hIsStraight) {
                                hIsStraight = false;
                                hIsInset = (v === 0);
                            }

                            if (vIsStraight) {
                                vIsStraight = false;
                                vIsInset = (h !== 0);
                            }
                        }

                        hEdges[h][v] = PuzzleImages.createPuzzleEdge(hCircleReductionRatio, hIsInset, hIsStraight);
                        vEdges[h][v] = PuzzleImages.createPuzzleEdge(vCircleReductionRatio, vIsInset, vIsStraight);
                    }
                }

                return { horizontalEdges: hEdges, verticalEdges: vEdges };
            };

            PuzzleImages.createPuzzleEdge = function (circleReductionRatio, isInset, isStraight) {
                if (typeof isInset === "undefined") { isInset = true; }
                if (typeof isStraight === "undefined") { isStraight = false; }
                var rPoints = [];

                if (!isStraight) {
                    // Get unit shape
                    var circleRadius = 0.125 * circleReductionRatio;
                    var cr = circleRadius;
                    var cr2 = circleRadius * 2;
                    var cr_2 = circleRadius / 2;

                    // Hard code a basic shape
                    var unitPoints = [
                        { x: 0, y: 0 },
                        { x: (0.5 - cr_2) / 2, y: 0 },
                        { x: 0.5 - cr_2, y: 0 },
                        { x: 0.5 - cr_2, y: cr_2 },
                        { x: 0.5 - cr, y: cr },
                        { x: 0.5 - cr, y: cr2 },
                        { x: 0.5, y: cr_2 + cr2 },
                        { x: 0.5 + cr, y: cr2 },
                        { x: 0.5 + cr, y: cr },
                        { x: 0.5 + cr_2, y: cr_2 },
                        { x: 0.5 + cr_2, y: 0 },
                        { x: 1 - ((0.5 - cr_2) / 2), y: 0 },
                        { x: 1, y: 0 }
                    ];

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

                        rPoints.push(u);
                    }
                } else {
                    // Straight
                    rPoints = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
                }

                // Calculation of final points
                var calculateFinalPoints = function (start, end, isReversed) {
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

                    var uPoints = rPoints;

                    if (isReversed) {
                        uPoints = uPoints.map(function (p) {
                            return p;
                        }).reverse();
                    }

                    var finalPoints = [];

                    for (var i = 0; i < rPoints.length; i++) {
                        var u = rPoints[i];

                        // Make final point
                        finalPoints.push({
                            x: Math.floor(start.x + (vect.x * u.x) + (pVect.x * u.y)),
                            y: Math.floor(start.y + (vect.y * u.x) + (pVect.y * u.y))
                        });
                    }

                    return finalPoints;
                };

                return { unitPoints: rPoints, getPoints: calculateFinalPoints };
            };
            return PuzzleImages;
        })();
        MemPuzzle.PuzzleImages = PuzzleImages;
    })(Told.MemPuzzle || (Told.MemPuzzle = {}));
    var MemPuzzle = Told.MemPuzzle;
})(Told || (Told = {}));
