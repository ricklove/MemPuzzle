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
        getPoints: (startPoint: IPoint, endPoint: IPoint) => IPoint[];
    }

    export interface IPoint {
        x: number;
        y: number;
    }

    export class PuzzleImages {

        public whole: IPieceImage;
        //       public active: IPieceImage;
        public pieces: IPieceImage[];

        constructor(columns: number, rows: number) {

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

            self.pieces = PuzzleImages.createPieces(columns, rows);
        }

        static createPieces(columns: number, rows: number): IPieceImage[] {
            throw new Error("Not Implemented");
            // Create pieces

            // Create piece canvases

            // Create piece positions

            // Create edges
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

    }

}