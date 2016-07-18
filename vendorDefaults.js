(function () {
    "use strict";

    var module_dependencies = [];

    /**
     * @name vendor.defaults
     *
     * @description
     *
     * This module is modified at build time. All variables prefixed with @@ will be replaced with the values
     * specified in the vendor.json file that indicates itself as the primary vendor. These values are then made
     * available to the rest of the AngularJS application.
     */

    angular
        .module("vendor.defaults", module_dependencies)
        .constant("vendorName", "@@vendorName")
        .constant("vendorLogo", "@@vendorLogo")
        .constant("vendorIcon", "@@vendorIcon")
        .constant("vendorPalette", {
            primary: "@@primaryPalette",
            accent: "@@accentPalette"
        })
        .constant("debugEnabled", @@debugEnabled);

}());