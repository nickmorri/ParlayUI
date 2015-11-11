function ParlayProtocolConnectionDetailController($mdDialog, protocol) {
    "use strict";

    /**
     * Returns the name of the protocol.
     * @returns {String} - Protocol name.
     */
    this.getProtocolName = function () {
        return protocol.getName();
    };

    /**
     * Returns an Array of collected log messages.
     * @returns {Array} - Log messages.
     */
    this.getLog = function () {
        return protocol.getLog();
    };

    /**
     * Hides the $mdDialog
     */
    this.hide = function () {
        $mdDialog.hide();
    };

}

angular.module("parlay.protocols.detail_controller", ["ngMaterial", "ngMessages", "ngMdIcons", "templates-main", "luegg.directives"])
	.controller("ParlayProtocolConnectionDetailController", ["$mdDialog", "protocol", ParlayProtocolConnectionDetailController]);