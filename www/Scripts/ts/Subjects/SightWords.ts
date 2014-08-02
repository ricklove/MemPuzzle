/// <reference path="../Subject.ts"/>

module TOLD.MemPuzzle.Subjects {

    export class SightWords implements Subject.ISubjectProvider {

        getSubject(): Subject.ISubject {

            var words = SightWords.wordList.split("\n").map(w=> w.trim());

            return { entries: words.map(w=> { return { word: w }; }) };
        }

        private static wordList = "it";

    }

}