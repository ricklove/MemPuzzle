///<reference path="ImageSource.ts"/>

module Told.MemPuzzle {

    export interface IPieceImage {
        canvas: WorkingCanvas;
        width: number;
        height: number;
        targetX: number;
        targetY: number;

        pRatioLeft: number;
        pRatioTop: number;
        pRatioRight: number;
        pRatioBottom: number;

        topEdge: IEdge;
        rightEdge: IEdge;
        bottomEdge: IEdge;
        leftEdge: IEdge;
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
                leftEdge: null,
            };

            self.pieces = PuzzleImages.createPieces(columns, rows, widthOverHeightRatio);
        }

        static createPieces(columns: number, rows: number, widthOverHeightRatio: number): IPieceImage[] {
            throw new Error("Not Implemented");

            var pieces = <IPieceImage[]>[];

            // Create edges
            var edges = PuzzleImages.createEdges(columns, rows, widthOverHeightRatio);

            // Create pieces
            var pRatioWidth = 1.0 / columns;
            var pRatioHeight = 1.0 / rows;

            for (var iCol = 0; iCol < columns; iCol++) {
                for (var iRow = 0; iRow < columns; iRow++) {
                    var p = <IPieceImage>{

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

                        topEdge: null,
                        rightEdge: null,
                        bottomEdge: null,
                        leftEdge: null,
                    };

                    pieces.push(p);
                }
            }

        }

        public draw(imageSource: ImageSource, targetWidth: number, targetHeight: number) {
            var self = this;

            // Draw whole puzzle from scaled image source
            PuzzleImages.drawWhole(self.whole, imageSource, targetWidth, targetHeight);

            // Draw pieces
            PuzzleImages.drawPieces(self.pieces, self.whole);
        }

        private static drawWhole(whole: IPieceImage, imageSource: ImageSource, targetWidth: number, targetHeight: number) {
            // Clear canvas
            //whole.canvas.canvasElement
            // Set canvas size
            // Draw image source to canvas as scaled image
        }

        private static drawPieces(pieces: IPieceImage[], whole: IPieceImage) {

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
        }


        private static createEdges(columns: number, rows: number, widthOverHeightRatio: number, makeOutsideFlat = true) {

            var hSideCount = columns;
            var vSideCount = rows;
            var pWidth = 1;
            var pHeight = 1;

            var hEdges = <IEdge[][]>[];
            var vEdges = <IEdge[][]>[];

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
        }

        private static createPuzzleEdge(circleReductionRatio: number, isInset = true, isStraight= false): IEdge {
            var rPoints = <IPoint[]>[];

            if (!isStraight) {
                // Get unit shape
                var circleRadius = 0.125 * circleReductionRatio;
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

                    rPoints.push(u);
                }
            }
            else {
                // Straight
                rPoints = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
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

                var uPoints = rPoints;

                if (isReversed) {
                    uPoints = uPoints.map(p=> p).reverse();
                }

                var finalPoints = <IPoint[]>[];

                for (var i = 0; i < rPoints.length; i++) {

                    var u = rPoints[i];

                    // Make final point
                    finalPoints.push({
                        x: Math.floor(start.x + (vect.x * u.x) + (pVect.x * u.y)),
                        y: Math.floor(start.y + (vect.y * u.x) + (pVect.y * u.y)),
                    });
                }

                return finalPoints;
            };


            return { unitPoints: rPoints, getPoints: calculateFinalPoints };
        }

    }

}