/// <reference path="MemPuzzle.ts"/>

module TOLD.MemPuzzle.Subject {

    export interface ISubjectProvider {
        getSubject(): ISubject;
    }

    export interface ISubject {
        entries: IEntry[];
    }

    export interface IEntry {
        word: string;
    }

    export class SubjectController {

        _puzzle: MemPuzzle;
        _subject: ISubject;
        _entryIndex: number;

        constructor(puzzle: MemPuzzle) {
            this._puzzle = puzzle;
            this._subject = null;
            this._entryIndex = -1;
        }

        loadSubject(subjectProvider: ISubjectProvider) {
            var self = this;
            var subject = subjectProvider.getSubject();

            self._subject = subject;

            self.gotoNextEntry();
        }

        gotoNextEntry() {
            var self = this;

            var eIndex = self._entryIndex = self._entryIndex + 1;

            if (eIndex >= self._subject.entries.length) {
                eIndex = self._entryIndex = 0;
            }

            var entry = self._subject.entries[eIndex];

            self._puzzle.createPuzzleFromText(entry.word, true);
        }
    }
}