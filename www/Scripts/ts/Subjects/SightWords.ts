﻿/// <reference path="../Subject.ts"/>

module Told.MemPuzzle.Subjects {

    export class SightWords implements Subject.ISubjectProvider {

        getSubject(): Subject.ISubject {

            var words = SightWords.wordList.split(" ").map(w=> w.trim()).filter(w=> w.length > 0 && w[0] !== "#");

            return { name: "Sight Words", entries: words.map(w=> { return { word: w }; }) };
        }

        private static wordList = ""//"Tag the go "
        + " #Pre-primer  the to and a I you it in said for up look is go we little down can see not one my me big come blue red where jump away here help make yellow two play run find three funny  #Primer  he was that she on they but at with all there out be have am do did what so get like this will yes went are now no came ride into good want too pretty four saw well ran brown eat who new must black white soon our ate say under please  #First  of his had him her some as then could when were them ask an over just from any how know put take every old by after think let going walk again may stop fly round give once open has live thank   #Second  would very your its around don't right green their call sleep five wash or before been off cold tell work first does goes write always made gave us buy those use fast pull both sit which read why found because best upon these sing wish many  #Third  if long about got six never seven eight today myself much keep try start ten bring drink only better hold warm full done light pick hurt cut kind fall carry small own show hot far draw clean grow together shall laugh";

    }

}