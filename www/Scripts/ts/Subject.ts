/// <reference path="MemPuzzle.ts"/>

// Subject

declare module tree {
    enum LeafType {
        SMALL_LEAVES= 10,
        MEDIUM_LEAVES= 200,
        BIG_LEAVES= 500,
        THIN_LEAVES= 900,
    }

    /**
     * @member draw
     * tree.draw() initializes tthe tree structure
     *
     * @param {object} ctx      the canvas context
     * @param {integer} x       x position to draw on the canvas
     * @param {integer} y       y position to draw on the canvas
     * @param {integer} width       width of the canvas
     * @param {integer} height       height of the canvas
     * @param {integer} maxDepth    how many branches the tree has
     * @param {float} spread    how much the tree branches are spread
     *                          Ranges from 0.3 - 1.
     * @param {boolean} leaves  draw leaves if set to true    
     *
     */
    function draw(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, maxDepth: number, rand: () => number, spread?: number, leaves?: boolean, leaveType?: LeafType);
}

module Told.MemPuzzle.Subject {

    export interface ISubjectProvider {
        getSubject(): ISubject;
    }

    export interface ISubject {
        name: string;
        entries: IEntry[];
    }

    export interface IEntry {
        word: string;
    }

    export class SubjectController {

        _puzzle: MemPuzzle;
        _subject: ISubject;

        getEntryIndex() {
            var self = this;
            var indexStr = localStorage.getItem("EntryIndex_" + self._subject.name);
            var index = parseInt(indexStr);

            if (isNaN(index) || index < 0) {
                return -1;
            }

            return index;
        }

        setEntryIndex(index: number) {
            var self = this;
            localStorage.setItem("EntryIndex_" + self._subject.name, index + "");
        }

        constructor(puzzle: MemPuzzle) {
            this._puzzle = puzzle;
            this._subject = null;
        }

        loadSubject(subjectProvider: ISubjectProvider) {
            var self = this;
            var subject = subjectProvider.getSubject();

            self._subject = subject;

            self.gotoNextEntry(false);
        }

        gotoNextEntry(shouldGoNext = true) {
            var self = this;

            var eIndex = self.getEntryIndex();

            if (shouldGoNext) {
                eIndex++;
            }

            if (eIndex < 0) {
                eIndex = 0;
            } else if (eIndex >= self._subject.entries.length) {
                eIndex = 0;
            }

            self.setEntryIndex(eIndex);


            var entry = self._subject.entries[eIndex];
            self._puzzle.createPuzzleFromText(entry.word, () => { setTimeout(() => { self.gotoNextEntry(); }, 1000); }, true);

            self.drawProgress();

            self._puzzle.addDecoration(self._canvasProgress, 0.7, 0.05, 0.25, 0.9);
        }

        private _canvasProgress: WorkingCanvas = null;

        drawProgress() {
            var self = this;
            var subject = self._subject;

            if (self._canvasProgress === null) {
                self._canvasProgress = WorkingCanvas.getWorkingCanvas();
                self._canvasProgress["seed"] = Math.random();
                self._canvasProgress["startIndex"] = self.getEntryIndex();
            }

            var seed = self._canvasProgress["seed"];
            var startIndex = self._canvasProgress["startIndex"];


            //var score = self.getEntryIndex();
            //var maxScore = subject.entries.length;

            var wCanvas = self._canvasProgress;
            var ctx = wCanvas.getContext();
            //var width = 400;
            //var height = 800;

            var width = window.innerWidth * 0.25;
            var height = width * 2;

            //var actualWidth = width * 1.5;
            //var actualHeight = height * 0.7;

            var actualWidth = width * 2.25;
            var actualHeight = height * 1.5;

            var xOffset = (actualWidth - width) / 2;
            var yOffset = (actualHeight - height);


            wCanvas.canvasElement.setAttribute("style", "background-color:white");
            wCanvas.canvasElement.width = actualWidth;
            wCanvas.canvasElement.height = actualHeight;
            ctx.clearRect(0, 0, actualWidth, actualHeight);


            var wPadding = 0.1 * width / 2;
            var hPadding = 0.02 * height / 2;
            var x = wPadding;
            var y = hPadding;
            var tWidth = width - wPadding * 2;
            var tHeight = height - hPadding * 2;

            var minDepth = 2;
            var maxDepth = 12;
            var scoreIndex = (self.getEntryIndex() - startIndex) % (maxDepth - minDepth);
            var scoreRatio = scoreIndex / (maxDepth - minDepth);

            if (scoreRatio === 0) {
                seed = self._canvasProgress["seed"] = Math.random();
            }

            var depth = minDepth + (maxDepth - minDepth) * scoreRatio;

            var drawTreeAtSize = (size: number) => {
                var s = size / 12;

                var stWidth = tWidth * s;
                var stHeight = tHeight * s;
                var sX = (width - stWidth) / 2;
                var sY = (height - stHeight) - hPadding;

                sX += xOffset;
                sY += yOffset;

                tree.draw(ctx, sX, sY, stWidth, stHeight, size, SubjectController.createRand(seed), 0.3, size > 6);
            };

            drawTreeAtSize(depth);


            // TESTING:
            //drawTreeAtSize(2);
            //drawTreeAtSize(4);
            //drawTreeAtSize(6);
            //drawTreeAtSize(8);
            //drawTreeAtSize(10);
            //drawTreeAtSize(12);

        }

        static createRand(seed: number) {

            seed *= 233280;

            var rand = function (max= 1, min= 0) {

                seed = (seed * 9301 + 49297) % 233280;
                var rnd = seed / 233280;

                return min + rnd * (max - min);
            };

            return rand;
        }
    }
}