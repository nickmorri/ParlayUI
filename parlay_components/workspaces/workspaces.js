(function () {
    "use strict";

    /**
     * @module ParlayWorkspaces
     */

    var module_dependencies = ["ui.router"];

    angular
        .module("parlay.workspaces", module_dependencies)
        .config(ParlayWorkspaces);

    ParlayWorkspaces.$inject = ["$stateProvider"];
    /**
     * The sets up the workspaces state for [ui.router]{@link https://github.com/angular-ui/ui-router}.
     * @member module:ParlayItem#ParlayWorkspaces
     * @param {Object} $stateProvider - Service provided by ui.router
     */
    function ParlayWorkspaces ($stateProvider) {
        $stateProvider.state("workspaces", {
            url: "/workspaces",
            templateUrl: "../parlay_components/workspaces/views/base.html",
            controller: "",
            controllerAs: "ctrl"
        });
    }

}());