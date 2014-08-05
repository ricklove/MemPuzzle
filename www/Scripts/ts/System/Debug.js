﻿/// <reference path="Analytics.ts" />
var Told;
(function (Told) {
    (function (Debug) {
        var Logger = (function () {
            function Logger() {
                this._elementId = "";
                this.entries = [];
            }
            Logger.prototype.log = function (category, message, sendToAnalytics) {
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
            };

            Logger.prototype.setElement = function (elementId) {
                this._elementId = elementId;

                // Show fps
                var self = this;
                var eID = this._elementId;
                var frameTimes = [Date.now()];
                var countFrame = function () {
                    if (eID === self._elementId) {
                        frameTimes.push(Date.now());
                        while (frameTimes.length > 100) {
                            frameTimes.shift();
                        }

                        setTimeout(countFrame, 0);
                    }
                };

                countFrame();

                var showFPS = function () {
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
            };

            Logger.prototype.writeMessages = function (elementId) {
                var _this = this;
                var element = document.getElementById(elementId);

                var text = this.entries.map(function (e) {
                    return _this.formatDateTime(e.time, true) + " : " + e.category + " : " + e.message;
                }).reverse().join("\r\n");
                element.textContent = text;
                element["textContentCopy"] = text;
            };

            // http://stackoverflow.com/questions/4744299/how-to-get-datetime-in-javascript
            Logger.prototype.formatDateTime = function (date, ignoreDate) {
                if (typeof ignoreDate === "undefined") { ignoreDate = false; }
                var padZero = this.padZero;

                var dateStr = [
                    date.getFullYear(),
                    padZero(date.getMonth() + 1),
                    padZero(date.getDate())
                ].join("-");

                var timeStr = [
                    [
                        padZero(date.getHours()),
                        padZero(date.getMinutes()),
                        padZero(date.getSeconds()) + "." + padZero(date.getMilliseconds(), 3)
                    ].join(":")
                ].join();

                if (ignoreDate) {
                    return timeStr;
                } else {
                    return dateStr + " " + timeStr;
                }
            };

            //Pad given value to the left with "0"
            Logger.prototype.padZero = function (num, digitCount) {
                if (typeof digitCount === "undefined") { digitCount = 2; }
                if (digitCount === 2) {
                    return (num >= 0 && num < 10) ? "0" + num : num + "";
                } else if (digitCount === 3) {
                    return (num >= 0 && num < 10) ? "00" + num : (num >= 10 && num < 100) ? "0" + num : num + "";
                }
            };
            return Logger;
        })();
        Debug.Logger = Logger;

        Debug.loggerInstance = new Logger();
    })(Told.Debug || (Told.Debug = {}));
    var Debug = Told.Debug;
})(Told || (Told = {}));

var Told;
(function (Told) {
    function log(category, message, sendToAnalytics) {
        Told.Debug.loggerInstance.log(category, message, sendToAnalytics);
    }
    Told.log = log;

    function enableLogging(elemendId) {
        Told.Debug.loggerInstance.setElement(elemendId);
    }
    Told.enableLogging = enableLogging;
})(Told || (Told = {}));
