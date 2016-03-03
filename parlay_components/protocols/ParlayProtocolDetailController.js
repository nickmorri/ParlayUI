function ParlayProtocolDetailController($scope, $mdDialog, $mdMedia, protocol) {
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

    // Attach reference to $mdMedia to scope so that media queries can be done.
    $scope.$mdMedia = $mdMedia

}

angular.module("parlay.protocols.detail_controller", ["ngMaterial", "ngMessages", "ngMdIcons", "templates-main", "luegg.directives"])
	.controller("ParlayProtocolDetailController", ["$scope", "$mdDialog", "$mdMedia", "protocol", ParlayProtocolDetailController]);