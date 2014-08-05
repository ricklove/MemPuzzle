/// <reference path="Analytics.ts" />

module Told.Debug {

    export interface LogEntry {
        // TODO: Change to Category, Action, Label, Value
        category: string;
        message: string;
        time: Date;
    }

    export class Logger {

        private _elementId: string = "";
        public entries: LogEntry[] = [];

        public log(category: string, message: string, sendToAnalytics: boolean) {

            this.entries.push({ category: category, message: message, time: new Date() });
            console.log(category + ": " + message);

            // Make analytics call
            if (sendToAnalytics) {
                Told.Analytics.GoogleAnalyticsMeasurementProtocol.trackEvent(category, message);
            }

            // Show on local logger if displayed
            if (this._elementId !== "") {
                this.writeMessages(this._elementId);
            }
        }

        public setElement(elementId: string) {
            this._elementId = elementId;

            // Show fps
            var self = this;
            var eID = this._elementId;
            var frameTimes: number[] = [Date.now()];
            var countFrame = () => {
                if (eID === self._elementId) {
                    frameTimes.push(Date.now());
                    while (frameTimes.length > 100) {
                        frameTimes.shift();
                    }

                    setTimeout(countFrame, 0);
                }
            };

            countFrame();

            var showFPS = () => {
                if (eID === self._elementId) {

                    if (frameTimes.length >= 100) {

                        var element = document.getElementById(elementId);

                        var fps = "";

                        for (var l = 1; l < 100; l *= 3) {
                            var fpsCalc = l * 1000 / (Date.now() - frameTimes[frameTimes.length - l]);

                            fps += fpsCalc + "\r\n";

                            if (fpsCalc < 50) {
                                element["badFPS"] = fpsCalc;
                            }
                        }

                        element.textContent = fps + "\r\n" + element["badFPS"] + "\r\n" + element["textContentCopy"];
                    }

                    setTimeout(showFPS, 250);

                }

            };

            showFPS();
        }

        private writeMessages(elementId: string) {
            var element = document.getElementById(elementId);

            var text = this.entries.map(e=> {
                return this.formatDateTime(e.time, true) + " : " + e.category + " : " + e.message;
            }).reverse().join("\r\n");
            element.textContent = text;
            element["textContentCopy"] = text;
        }

        // http://stackoverflow.com/questions/4744299/how-to-get-datetime-in-javascript
        formatDateTime(date: Date, ignoreDate: boolean = false) {

            var padZero = this.padZero;

            var dateStr = [
                date.getFullYear(),
                padZero(date.getMonth() + 1),
                padZero(date.getDate()),
            ].join("-");

            var timeStr = [
                [
                    padZero(date.getHours()),
                    padZero(date.getMinutes()),
                    padZero(date.getSeconds()) + "." + padZero(date.getMilliseconds(), 3),
                ].join(":"),
                //date.getHours() >= 12 ? " PM" : " AM"
            ].join();

            if (ignoreDate) {
                return timeStr;
            } else {
                return dateStr + " " + timeStr;
            }
        }

        //Pad given value to the left with "0"
        padZero(num: number, digitCount: number = 2) {
            if (digitCount === 2) {
                return (num >= 0 && num < 10) ? "0" + num : num + "";
            } else if (digitCount === 3) {
                return (num >= 0 && num < 10) ? "00" + num
                    : (num >= 10 && num < 100) ? "0" + num : num + "";
            }
        }
    }

    export var loggerInstance = new Logger();
}

module Told {

    export function log(category: string, message: string, sendToAnalytics: boolean) {
        Debug.loggerInstance.log(category, message, sendToAnalytics);
    }

    export function enableLogging(elemendId: string) {
        Debug.loggerInstance.setElement(elemendId);
    }

    export function enableErrorLogging() {
        // From: http://stackoverflow.com/questions/20500190/window-onerror-in-ts-0-9-5-is-impossible
        window.onerror = function (eventOrMessage: any, source: string, fileno: number, colnumber?: number): any {
            Told.log("ERROR", "URL:" + source + " line:" + fileno + " Message: " + eventOrMessage, true);
        };
    }
}