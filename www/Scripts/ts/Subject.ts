/// <reference path="MemPuzzle.ts"/>

// Subject
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
        }
    }
}