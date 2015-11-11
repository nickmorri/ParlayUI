function ParlayProtocolConnectionDetailController($mdDialog, protocol) {
    "use strict";

    this.getProtocolName = function () {
        return protocol.getName();
    };
    
    this.getLog = function () {
        return protocol.getLog();
    };
    
    this.hide = function () {
        $mdDialog.hide();
    };

}

angular.module("parlay.protocols.detail_controller", ["ngMaterial", "ngMessages", "ngMdIcons", "templates-main", "luegg.directives"])
	.controller("ParlayProtocolConnectionDetailController", ["$mdDialog", "protocol", ParlayProtocolConnectionDetailController]);