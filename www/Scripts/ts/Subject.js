/// <reference path="MemPuzzle.ts"/>
var TOLD;
(function (TOLD) {
    (function (MemPuzzle) {
        (function (Subject) {
            var SubjectController = (function () {
                function SubjectController(puzzle) {
                    this._puzzle = puzzle;
                    this._subject = null;
                    this._entryIndex = -1;
                }
                SubjectController.prototype.loadSubject = function (subjectProvider) {
                    var self = this;
                    var subject = subjectProvider.getSubject();

                    self._subject = subject;

                    self.gotoNextEntry();
                };

                SubjectController.prototype.gotoNextEntry = function () {
                    var self = this;

                    var eIndex = self._entryIndex = self._entryIndex + 1;

                    if (eIndex >= self._subject.entries.length) {
                        eIndex = self._entryIndex = 0;
                    }

                    var entry = self._subject.entries[eIndex];

                    self._puzzle.createPuzzleFromText(entry.word, function () {
                        self.gotoNextEntry();
                    }, true);
                };
                return SubjectController;
            })();
            Subject.SubjectController = SubjectController;
        })(MemPuzzle.Subject || (MemPuzzle.Subject = {}));
        var Subject = MemPuzzle.Subject;
    })(TOLD.MemPuzzle || (TOLD.MemPuzzle = {}));
    var MemPuzzle = TOLD.MemPuzzle;
})(TOLD || (TOLD = {}));
