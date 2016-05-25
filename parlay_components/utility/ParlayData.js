(function () {
    "use strict";

    // Simple wrapper for a JavaScript Map.

    angular.module("parlay.data", [])
        .factory("ParlayData", function () {
            return new Map();
        });

}());