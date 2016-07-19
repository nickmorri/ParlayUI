(function () {
    "use strict";

    var module_dependencies = [];

    function initSkulpt() {
        @@importSkulpt
    }

    function initParlayModules() {
        function registerModule(path, module) {
            Sk.builtinFiles.files[path] = "var $builtinmodule = " + module;
        }
        @@importParlay
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
        .constant("skulpt", "(" + initSkulpt + ").call(this);")
        .constant("parlayModules", "(" + initParlayModules + ").call(this);")
        //the milisecond delay between worker pool collections
        .constant("refreshRate", 60000);

}());