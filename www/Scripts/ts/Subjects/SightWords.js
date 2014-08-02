/// <reference path="../Subject.ts"/>
var TOLD;
(function (TOLD) {
    (function (MemPuzzle) {
        (function (Subjects) {
            var SightWords = (function () {
                function SightWords() {
                }
                SightWords.prototype.getSubject = function () {
                    var words = SightWords.wordList.split("\n").map(function (w) {
                        return w.trim();
                    });

                    return { entries: words.map(function (w) {
                            return { word: w };
                        }) };
                };

                SightWords.wordList = "it";
                return SightWords;
            })();
            Subjects.SightWords = SightWords;
        })(MemPuzzle.Subjects || (MemPuzzle.Subjects = {}));
        var Subjects = MemPuzzle.Subjects;
    })(TOLD.MemPuzzle || (TOLD.MemPuzzle = {}));
    var MemPuzzle = TOLD.MemPuzzle;
})(TOLD || (TOLD = {}));
