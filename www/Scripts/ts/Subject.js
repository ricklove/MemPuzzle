/// <reference path="MemPuzzle.ts"/>

var Told;
(function (Told) {
    (function (MemPuzzle) {
        (function (Subject) {
            var SubjectController = (function () {
                function SubjectController(puzzle) {
                    this._canvasProgress = null;
                    this._puzzle = puzzle;
                    this._subject = null;
                }
                SubjectController.prototype.getEntryIndex = function () {
                    var self = this;
                    var indexStr = localStorage.getItem("EntryIndex_" + self._subject.name);
                    var index = parseInt(indexStr);

                    if (isNaN(index) || index < 0) {
                        return -1;
                    }

                    return index;
                };

                SubjectController.prototype.setEntryIndex = function (index) {
                    var self = this;
                    localStorage.setItem("EntryIndex_" + self._subject.name, index + "");
                };

                SubjectController.prototype.loadSubject = function (subjectProvider) {
                    var self = this;
                    var subject = subjectProvider.getSubject();

                    self._subject = subject;

                    self.gotoNextEntry(false);
                };

                SubjectController.prototype.gotoNextEntry = function (shouldGoNext) {
                    if (typeof shouldGoNext === "undefined") { shouldGoNext = true; }
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
                    self._puzzle.createPuzzleFromText(entry.word, function () {
                        setTimeout(function () {
                            self.gotoNextEntry();
                        }, 1000);
                    }, true);

                    self.drawProgress();

                    self._puzzle.addDecoration(self._canvasProgress, 0.7, 0.05, 0.25, 0.9);
                };

                SubjectController.prototype.drawProgress = function () {
                    var self = this;
                    var subject = self._subject;

                    // TODO: Base score on something substantial (not just index)
                    var score = self.getEntryIndex();
                    var maxScore = subject.entries.length;

                    if (self._canvasProgress === null) {
                        self._canvasProgress = Told.MemPuzzle.WorkingCanvas.getWorkingCanvas();
                    }

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
                    var depth = minDepth + (maxDepth - minDepth) * score / maxScore;

                    var drawTreeAtSize = function (size) {
                        var s = size / 12;

                        var stWidth = tWidth * s;
                        var stHeight = tHeight * s;
                        var sX = (width - stWidth) / 2;
                        var sY = (height - stHeight) - hPadding;

                        sX += xOffset;
                        sY += yOffset;

                        tree.draw(ctx, sX, sY, stWidth, stHeight, size, 0.3, size > 6);
                    };

                    drawTreeAtSize(depth);
                    // TESTING:
                    //drawTreeAtSize(2);
                    //drawTreeAtSize(4);
                    //drawTreeAtSize(6);
                    //drawTreeAtSize(8);
                    //drawTreeAtSize(10);
                    //drawTreeAtSize(12);
                };
                return SubjectController;
            })();
            Subject.SubjectController = SubjectController;
        })(MemPuzzle.Subject || (MemPuzzle.Subject = {}));
        var Subject = MemPuzzle.Subject;
    })(Told.MemPuzzle || (Told.MemPuzzle = {}));
    var MemPuzzle = Told.MemPuzzle;
})(Told || (Told = {}));
