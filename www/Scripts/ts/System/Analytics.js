﻿/// <reference path="AppSettings.ts" />
var Told;
(function (Told) {
    (function (Analytics) {
        // Manually call google analytics
        // https://developers.google.com/analytics/devguides/collection/protocol/v1/
        // https://developers.google.com/analytics/devguides/collection/protocol/v1/devguide
        // https://developers.google.com/analytics/devguides/collection/protocol/v1/reference
        //POST / collect HTTP / 1.1
        //Host: www.google-analytics.com
        //payload_data
        // Required
        //v=1             // Version.
        //&tid=UA-XXXX-Y  // Tracking ID / Web property / Property ID.
        //&cid=555        // Anonymous Client ID.
        //&t=             // Hit Type.
        //    Example:
        //v=1&tid=UA-XXXX-Y&cid=555&t=pageview&dp=%2Fhome
        //    Page Tracking
        //v=1             // Version.
        //&tid=UA-XXXX-Y  // Tracking ID / Web property / Property ID.
        //&cid=555        // Anonymous Client ID.
        //&t=pageview     // Pageview hit type.
        //&dh=mydemo.com  // Document hostname.
        //&dp=/home       // Page.
        //&dt=homepage    // Title.
        //Event Tracking
        //v=1             // Version.
        //&tid=UA-XXXX-Y  // Tracking ID / Web property / Property ID.
        //&cid=555        // Anonymous Client ID.
        //&t=event        // Event hit type
        //&ec=video       // Event Category. Required.
        //&ea=play        // Event Action. Required.
        //&el=holiday     // Event label.
        //&ev=300         // Event value.
        var GoogleAnalyticsMeasurementProtocol = (function () {
            function GoogleAnalyticsMeasurementProtocol() {
            }
            GoogleAnalyticsMeasurementProtocol.trackPageView = function () {
                var guaTrackingID = Told.AppSettings.GoogleAnalyticsTrackingID;
                var clientUUID = GoogleAnalyticsMeasurementProtocol.getClientUUID();

                var data = new Data();

                data.append('v', '1');
                data.append('tid', guaTrackingID);
                data.append('cid', clientUUID);

                //&t=pageview     // Pageview hit type.
                //&dh=mydemo.com  // Document hostname.
                //&dp=/home       // Page.
                //&dt=homepage    // Title.
                data.append('t', "pageview");
                data.append('dh', "toldpro.com");
                data.append('dp', "/home");
                data.append('dt', "Main");

                data.append('z', "" + Math.random());

                console.log("GA: " + data.toString());

                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'http://www.google-analytics.com/collect?' + data.toString(), true);
                xhr.send();
                //var xhr = new XMLHttpRequest();
                //xhr.open('POST', 'http://www.google-analytics.com/collect', true);
                //xhr.send(d.toString());
            };

            GoogleAnalyticsMeasurementProtocol.trackEvent = function (category, action, label, value) {
                if (typeof label === "undefined") { label = ""; }
                if (typeof value === "undefined") { value = ""; }
                if (!GoogleAnalyticsMeasurementProtocol.hasSentPageView) {
                    GoogleAnalyticsMeasurementProtocol.trackPageView();
                }

                // Universal Analytics method (which does not work in installed apps)
                // DEBUG
                //if (window["ga"]) {
                //    window["ga"]('send', 'event', category, action);
                //}
                // Measurement Protocol direct call
                // Manual ajax request
                // http://www.aaron-powell.com/posts/2013-08-02-ajax-without-jquery.html
                // Required
                //v=1             // Version.
                //&tid=UA-XXXX-Y  // Tracking ID / Web property / Property ID.
                //&cid=555        // Anonymous Client ID.
                //&t=             // Hit Type.
                var guaTrackingID = Told.AppSettings.GoogleAnalyticsTrackingID;
                var clientUUID = GoogleAnalyticsMeasurementProtocol.getClientUUID();

                //var data = new FormData();
                var data = new Data();

                data.append('v', '1');
                data.append('tid', guaTrackingID);
                data.append('cid', clientUUID);

                // This is required to associate it with the correct page
                data.append('dh', "toldpro.com");
                data.append('dp', "/home");
                data.append('dt', "Main");

                //&t=event        // Event hit type
                //&ec=video       // Event Category. Required.
                //&ea=play        // Event Action. Required.
                //&el=holiday     // Event label.
                //&ev=300         // Event value.
                data.append('t', "event");
                data.append('ec', category);
                data.append('ea', action);

                if (label !== "") {
                    data.append('el', label);
                }
                if (value !== "") {
                    data.append('ev', value);
                }

                data.append('z', "" + Math.random());

                console.log("GA: " + data.toString());

                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'http://www.google-analytics.com/collect?' + data.toString(), true);
                xhr.send();
                //var xhr = new XMLHttpRequest();
                ////xhr.open('POST', 'http://www.google-analytics.com');
                //xhr.open('POST', 'http://www.google-analytics.com/collect', true);
                //xhr.send(data.toString());
            };

            GoogleAnalyticsMeasurementProtocol.getClientUUID = function () {
                var generateGUID = function () {
                    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
                    var d = new Date().getTime();
                    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = (d + Math.random() * 16) % 16 | 0;
                        d = Math.floor(d / 16);
                        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                    });
                    return uuid;
                };

                // Store in localStorage
                if (!localStorage["ClientUUID"]) {
                    localStorage["ClientUUID"] = generateGUID();
                }

                var id = localStorage["ClientUUID"];
                return id;
            };
            GoogleAnalyticsMeasurementProtocol.hasSentPageView = false;
            return GoogleAnalyticsMeasurementProtocol;
        })();
        Analytics.GoogleAnalyticsMeasurementProtocol = GoogleAnalyticsMeasurementProtocol;

        var Data = (function () {
            function Data() {
                this.items = [];
            }
            Data.prototype.append = function (key, value) {
                key = encodeURIComponent(key);
                value = encodeURIComponent(value);

                this.items.push({ key: key, value: value });
            };

            Data.prototype.toString = function () {
                return this.items.map(function (item) {
                    return item.key + "=" + item.value;
                }).join("&");
            };
            return Data;
        })();

        // Track page view as soon as this is loaded
        Analytics.trackPageView = function () {
            GoogleAnalyticsMeasurementProtocol.trackPageView();
        };
    })(Told.Analytics || (Told.Analytics = {}));
    var Analytics = Told.Analytics;
})(Told || (Told = {}));
