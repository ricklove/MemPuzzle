///<reference path="ImageSource.ts"/>

module Told.MemPuzzle {

    export interface IPieceImage {
        imageOrCanvas: any;
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
        private _imageSource: ImageSource;

        public whole: IPieceImage;
        //       public active: IPieceImage;
        public pieces: IPieceImage[];

        static createPieces(columns: number, rows: number): IPieceImage[] {

            // Create pieces

            // Create piece canvases

            // Create piece positions

            // Create edges

        }

        static drawWhole(imageSource: ImageSource, targetWidth: number, targetHeight: number): IPieceImage {
            // Draw whole puzzle from scaled image source
        }

        static drawPieces(whole: IPieceImage) : IPieceImage[] {

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
        }

    }

}