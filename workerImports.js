(function () {
    "use strict";

    var module_dependencies = [];

    var initSkulpt = function() {
        @@importSkulpt
    }

    /**
     * @name worker.imports
     *
     * @description
     *
     * This module is modified at build time. All variables prefixed with @@ will be replaced with scripts
     * pulled from URLs. These scripts are then made available to the rest of the AngularJS application.
     */

    angular
        .module("worker.imports", module_dependencies)
        .constant("skulpt", "(" + initSkulpt + ").call(this);");

}());