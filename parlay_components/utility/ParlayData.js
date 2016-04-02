function ParlayDataFactory() {
    "use strict";

    var container = new Map();

    function ParlayData() {}

    ParlayData.prototype.clear = function () {
        container.clear();
    };

    ParlayData.prototype.delete = function (key) {
        return container.delete(key);
    };

    ParlayData.prototype.entries = function () {
        return container.entries();
    };

    ParlayData.prototype.forEach = function (callbackFn, thisArg) {
        container.forEach(callbackFn, thisArg);
    };

    ParlayData.prototype.get = function (key) {
        return container.get(key);
    };

    ParlayData.prototype.has = function (key) {
        return container.has(key);
    };

    ParlayData.prototype.keys = function () {
        return container.keys();
    };

    ParlayData.prototype.set = function (key, value) {
        container.set(key, value);
    };

    ParlayData.prototype.values = function () {
        return container.values();
    };

    return new ParlayData();
}

angular.module("parlay.data", [])
    .factory("ParlayData", [ParlayDataFactory]);