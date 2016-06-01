(function () {
    "use strict";

    /**
     * @module ParlayNavigation
     */

    var module_dependencies = ["ngMaterial", "parlay.navigation.sidenav", "vendor.defaults"];

    angular.module("parlay.navigation.container", module_dependencies)
        .controller("ParlayNavigationContainerController", ParlayNavigationContainerController)
        .directive("parlayNavigationContainer", ParlayNavigationContainer);

    /* istanbul ignore next */
    ParlayNavigationContainerController.$inject = ["$mdSidenav", "vendorLogo", "vendorIcon"];
    /**
     * Controller for the ParlayNavigationContainer.
     * @constructor module:ParlayNavigation.ParlayNavigationContainerController
     * @param {Object} $mdSidenav - Angular Material dialog service.
     * @param {String} vendorLogo - Base64 encoded version of the logo image.
     * @param {String} vendorIcon - Base64 encoded version of the icon image.
     */
    function ParlayNavigationContainerController ($mdSidenav, vendorLogo, vendorIcon) {

        /**
         * Base64 encoded version of the logo image.
         * @method module:ParlayNavigation.ParlayNavigationContainerController#vendorLogo
         * @public
         * @type {String}
         */
        this.vendorLogo = vendorLogo;

        /**
         * Base64 encoded version of the icon image.
         * @method module:ParlayNavigation.ParlayNavigationContainerController#vendorIcon
         * @public
         * @type {String}
         */
        this.vendorIcon = vendorIcon;

        /**
         * Toggles the navigation $mdSidenav.
         * @method module:ParlayNavigation.ParlayNavigationContainerController#toggleSidenav
         * @public
         */
        this.toggleSidenav = function () {
            $mdSidenav("navigation").toggle();
        };

    }

    /* istanbul ignore next */
    ParlayNavigationContainer.$inject = ["themeColor"];
    /**
     * Directive definition for <parlay-navigation-container></parlay-navigation-container>.
     * @constructor module:ParlayNavigation.ParlayNavigationContainer
     * @param {String} themeColor
     * @returns {Object} - Directive defintion
     * @constructor
     */
    function ParlayNavigationContainer (themeColor) {
        return {
            templateUrl: "../parlay_components/navigation/directives/parlay-navigation-container.html",
            controller: "ParlayNavigationContainerController",
            controllerAs: "ctrl",
            link: function (scope, element) {
                element.find("md-list")[0].style.backgroundColor = themeColor;
            }
        };
    }

}());