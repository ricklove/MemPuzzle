/// <reference path="MemPuzzle.ts"/>
var Told;
(function (Told) {
    (function (MemPuzzle) {
        // Subject
        (function (Subject) {
            var SubjectController = (function () {
                function SubjectController(puzzle) {
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
                };
                return SubjectController;
            })();
            Subject.SubjectController = SubjectController;
        })(MemPuzzle.Subject || (MemPuzzle.Subject = {}));
        var Subject = MemPuzzle.Subject;
    })(Told.MemPuzzle || (Told.MemPuzzle = {}));
    var MemPuzzle = Told.MemPuzzle;
})(Told || (Told = {}));
