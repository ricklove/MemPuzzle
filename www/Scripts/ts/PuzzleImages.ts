///<reference path="ImageSource.ts"/>

module Told.MemPuzzle {

    export interface IPieceImage {
        id: string;

        canvas: WorkingCanvas;
        width: number;
        height: number;
        targetX: number;
        targetY: number;

        pRatioLeft: number;
        pRatioTop: number;
        pRatioRight: number;
        pRatioBottom: number;

        leftEdge: IEdge;
        topEdge: IEdge;
        rightEdge: IEdge;
        bottomEdge: IEdge;
    }

    export interface IEdge {
        unitPoints: IPoint[];
        getPoints: (startPoint: IPoint, endPoint: IPoint, isReversed: boolean) => IPoint[];
    }

    export interface IPoint {
        x: number;
        y: number;
    }

    export class PuzzleImages {

        public whole: IPieceImage;
        //       public active: IPieceImage;
        public pieces: IPieceImage[];

        constructor(columns: number, rows: number, widthOverHeightRatio: number) {

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
                bottomEdge: null,
            };

            self.whole.canvas.canvasElement.setAttribute("id", self.whole.id);

            self.pieces = PuzzleImages.createPieces(columns, rows, widthOverHeightRatio);
        }

        release() {
            var self = this;
            self.whole.canvas.release();

            for (var i = 0; i < self.pieces.length; i++) {
                self.pieces[i].canvas.release();
            }

            self.whole = null;
            self.pieces = null;
        }

        static createPieces(columns: number, rows: number, widthOverHeightRatio: number): IPieceImage[] {
            var pieces = <IPieceImage[]>[];

            // Create edges
            var edges = PuzzleImages.createEdges(columns, rows, widthOverHeightRatio);

            // Create pieces
            var pRatioWidth = 1.0 / columns;
            var pRatioHeight = 1.0 / rows;

            for (var iCol = 0; iCol < columns; iCol++) {
                for (var iRow = 0; iRow < rows; iRow++) {
                    var p = <IPieceImage>{

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
                        bottomEdge: edges.horizontalEdges[iCol][iRow + 1],
                    };

                    p.canvas.canvasElement.setAttribute("id", p.id);

                    pieces.push(p);
                }
            }

            return pieces;
        }

        public draw(imageSource: ImageSource, targetWidth: number, targetHeight: number) {
            var self = this;

            // Draw whole puzzle from scaled image source
            PuzzleImages.drawWhole(self.whole, imageSource, targetWidth, targetHeight);

            // Draw pieces
            PuzzleImages.drawPieces(self.pieces, self.whole);
        }

        private static drawWhole(whole: IPieceImage, imageSource: ImageSource, targetWidth: number, targetHeight: number) {

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
        }

        private static drawPieces(pieces: IPieceImage[], whole: IPieceImage) {

            var DEBUG = false;
            var useStraightEdges = false;

            // Get working canvas
            var wCanvas = WorkingCanvas.getWorkingCanvas();
            var ctx = wCanvas.getContext();

            // Set canvas size
            var width = wCanvas.canvasElement.width = whole.width;
            var height = wCanvas.canvasElement.height = whole.height;

            // For each piece (including whole)
            for (var i = 0; i < pieces.length; i++) {


                // DEBUG
                var doWork = (iInner: number) => {
                    var piece = pieces[iInner];

                    var left = piece.pRatioLeft * width;
                    var right = piece.pRatioRight * width;
                    var top = piece.pRatioTop * height;
                    var bottom = piece.pRatioBottom * height;

                    left = Math.ceil(left);
                    right = Math.ceil(right);
                    top = Math.ceil(top);
                    bottom = Math.ceil(bottom);

                    // Bounds
                    var bLeft = left;
                    var bTop = top;
                    var bRight = right;
                    var bBottom = bottom;


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

                    if (useStraightEdges) {
                        ctx.moveTo(left, top);
                        ctx.lineTo(right, top);
                        ctx.lineTo(right, bottom);
                        ctx.lineTo(left, bottom);
                        //ctx.lineTo(left, top);
                    } else {
                        // Use edges
                        var topEdgePoints = piece.topEdge.getPoints({ x: left, y: top }, { x: right, y: top }, false);
                        var rightEdgePoints = piece.rightEdge.getPoints({ x: right, y: top }, { x: right, y: bottom }, false);
                        var bottomEdgePoints = piece.bottomEdge.getPoints({ x: right, y: bottom }, { x: left, y: bottom }, true);
                        var leftEdgePoints = piece.leftEdge.getPoints({ x: left, y: bottom }, { x: left, y: top }, true);

                        ctx.moveTo(left, top);

                        PuzzleImages.curveThroughPoints(ctx, topEdgePoints);
                        PuzzleImages.curveThroughPoints(ctx, rightEdgePoints);
                        PuzzleImages.curveThroughPoints(ctx, bottomEdgePoints);
                        PuzzleImages.curveThroughPoints(ctx, leftEdgePoints);

                        // Calculate bounds
                        var pad = 2;

                        var getBounds = (points: IPoint[]) => {
                            for (var iPoint = 0; iPoint < points.length; iPoint++) {
                                var p = points[iPoint];

                                if (p.x - pad < bLeft) { bLeft = p.x - pad; }
                                if (p.x + pad > bRight) { bRight = p.x + pad; }
                                if (p.y - pad < bTop) { bTop = p.y - pad; }
                                if (p.y + pad > bBottom) { bBottom = p.y + pad; }
                            }
                        };

                        getBounds(topEdgePoints);
                        getBounds(rightEdgePoints);
                        getBounds(bottomEdgePoints);
                        getBounds(leftEdgePoints);
                    }


                    ctx.closePath();
                    ctx.clip();


                    // Draw whole puzzle (in clip)
                    ctx.drawImage(whole.canvas.canvasElement, 0, 0, width, height);
                    ctx.restore();

                    // Bounds size
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

                var doWorkInner = (() => { var i2 = i; return () => { doWork(i2); } })();

                if (DEBUG) {
                    setTimeout(doWorkInner, 1000 * i);
                } else {
                    doWorkInner();
                }
            }

            wCanvas.release();
        }


        private static createEdges(columns: number, rows: number, widthOverHeightRatio: number, makeOutsideFlat = false) {

            var hSideCount = columns;
            var vSideCount = rows;

            var hEdges = <IEdge[][]>[];
            var vEdges = <IEdge[][]>[];

            for (var h = 0; h < hSideCount + 1; h++) {
                hEdges.push([]);
                vEdges.push([]);

                for (var v = 0; v < vSideCount + 1; v++) {

                    var hCircleReductionRatio = 1 / widthOverHeightRatio;
                    var vCircleReductionRatio = widthOverHeightRatio;

                    hCircleReductionRatio = Math.min(1, hCircleReductionRatio);
                    vCircleReductionRatio = Math.min(1, vCircleReductionRatio);


                    var hIsInset = Math.random() > 0.5;
                    var vIsInset = Math.random() > 0.5;

                    var hIsStraight = (v === 0) || (v === vSideCount);
                    var vIsStraight = (h === 0) || (h === hSideCount);

                    if (!makeOutsideFlat) {
                        if (hIsStraight) {
                            hIsStraight = false;
                            // top=inset, bottom=outset (reversed)
                            hIsInset = (v === 0);
                        }

                        if (vIsStraight) {
                            vIsStraight = false;
                            // right=inset, left=outset (reversed)
                            vIsInset = (h !== 0);
                        }
                    }

                    hEdges[h][v] = PuzzleImages.createPuzzleEdge(hCircleReductionRatio, hIsInset, hIsStraight);
                    vEdges[h][v] = PuzzleImages.createPuzzleEdge(vCircleReductionRatio, vIsInset, vIsStraight);
                }
            }

            return { horizontalEdges: hEdges, verticalEdges: vEdges };
        }

        private static createPuzzleEdge(circleReductionRatio: number, isInset = true, isStraight= false): IEdge {
            var randomPoints = <IPoint[]>[];

            if (!isStraight) {
                // Get unit shape
                var BASE_RADIUS = 0.125;
                //var BASE_RADIUS = 0.1;

                var circleRadius = BASE_RADIUS * circleReductionRatio;
                var cr = circleRadius;
                var cr2 = circleRadius * 2;
                var cr_2 = circleRadius / 2;

                // Hard code a basic shape
                var unitPoints = <IPoint[]>[
                    { x: 0, y: 0 },
                    { x: (0.5 - cr_2) / 2, y: 0 },
                    { x: 0.5 - cr_2, y: 0 },          //  { x: 0.45, y: 0 },
                    { x: 0.5 - cr_2, y: cr_2 },       //  { x: 0.45, y: 0.05 },
                    { x: 0.5 - cr, y: cr },         //  { x: 0.4, y: 0.1 },
                    { x: 0.5 - cr, y: cr2 },         //  { x: 0.4, y: 0.2 },
                    { x: 0.5, y: cr_2 + cr2 },        //  { x: 0.5, y: 0.25 },
                    { x: 0.5 + cr, y: cr2 },         //  { x: 0.6, y: 0.2 },
                    { x: 0.5 + cr, y: cr },         //  { x: 0.6, y: 0.1 },
                    { x: 0.5 + cr_2, y: cr_2 },       //  { x: 0.55, y: 0.05 },
                    { x: 0.5 + cr_2, y: 0 },          //  { x: 0.55, y: 0 },
                    { x: 1 - ((0.5 - cr_2) / 2), y: 0 },
                    { x: 1, y: 0 },
                ];

                // Randomize unit shape
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

                    randomPoints.push(u);
                }
            }
            else {
                // Straight
                randomPoints = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
            }

            // Calculation of final points
            var calculateFinalPoints = (start: IPoint, end: IPoint, isReversed: boolean) => {

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

                var uPoints = randomPoints;

                if (isReversed) {
                    uPoints = uPoints.map(p=> { return { x: 1 - p.x, y: -p.y }; }).reverse();
                }

                var finalPoints = <IPoint[]>[];

                for (var i = 0; i < uPoints.length; i++) {

                    var u = uPoints[i];

                    // Make final point
                    finalPoints.push({
                        x: Math.floor(start.x + (vect.x * u.x) + (pVect.x * u.y)),
                        y: Math.floor(start.y + (vect.y * u.x) + (pVect.y * u.y)),
                    });
                }

                return finalPoints;
            };


            return { unitPoints: randomPoints, getPoints: calculateFinalPoints };
        }

        // Based on: http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
        private static curveThroughPoints(ctx: CanvasRenderingContext2D, points: IPoint[]) {

            // Line through points
            //for (var iSide = 0; iSide < side.length; iSide++) {
            //    var s = side[iSide];
            //    ctx.lineTo(s.x, s.y);
            //}

            for (var i = 0; i < points.length - 2; i++) {
                var xc = (points[i].x + points[i + 1].x) / 2;
                var yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }

            // Last Point
            ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        }

    }

}