(function () {
    "use strict";

    var module_dependencies = [];

    function initSkulpt() {
        @@importSkulpt // jshint ignore:line
    }

    function initParlayModules() {
        Sk.externalLibraries = {};

        // format and add the necessary information for Skulpt to use this module
        function registerModule(name, module, ext) {

            // embed the actual code inside the js wrapper
            if (ext === "js") {
                // ("" + module) returns the code of module as a string
                module = {funcname: module.name, code: "" + module};
            }

            // register this module
            Sk.externalLibraries[name] = {
                path: name,
                // since we're loading all of our own modules locally,
                // we shouldn't need to list dependencies
                dependencies: [],
                type: ext
            };
            // pre-cache the module since there is no file for it
            // Skulpt will check the cache first and never look for the file
            Sk.externalLibraryCache[name] = module;

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