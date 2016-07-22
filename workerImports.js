(function () {
    "use strict";

    var module_dependencies = [];

    function initSkulpt() {
        @@importSkulpt // jshint ignore:line
    }

    function initParlayModules() {
        Sk.externalLibraries = {};

        // format and add the necessary information for Skulpt to use this module
        function registerModule(name, module, parent) {

            module.$dependencies = module.$dependencies || [];

            // register this module
            Sk.externalLibraries[name] = {
                path: name,
                // for python modules, the parent will be the only dependency
                // al others will be handled by import
                dependencies: module.$dependencies,
                type: "js"
            };
            // pre-cache the module since there is no file for it
            // Skulpt will check the cache first and never look for the file
            Sk.externalLibraryCache[name] = {funcname: "$builtinmodule", code:"var $builtinmodule = " + module};
        }

        @@importParlay // jshint ignore:line

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