(function () {
    "use strict";

    /**
     * Provides a centralized location for items that are a data source to register themselves. Other modules can then
     * access ParlayData to retrieve all available data providers.
     * Functionally a simple wrapper for a JavaScript Map.
     * @module ParlayData
     */
    angular.module("parlay.data", [])
        .factory("ParlayData", function () {
            return new Map();
        });

}());