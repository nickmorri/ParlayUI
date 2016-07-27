(function () {
    "use strict";

    var module_dependencies = [];

    function initSkulpt() {
        @@importSkulpt // jshint ignore:line
        Sk.loadExternalLibraryInternal_ = function (path, inject) {
            return Sk.read(path);
        };
    }

    function initParlayModules() {
        Sk.externalLibraries = {};

        // format and add the necessary information for Skulpt to use this module
        function registerModule(path, name, module, ext) {


            // register this module
            Sk.externalLibraries[name] = {
                path: path,
                // since we're loading all of our own modules locally,
                // we shouldn't need to list dependencies
                dependencies: [],
                type: ext
            };

            // add the file to the builtin files
            // this makes the file available to Sk.read()
            Sk.builtinFiles = Sk.builtinFiles || {};
            Sk.builtinFiles.files = Sk.builtinFiles.files || {};


            if (ext === "js") {
                // if module is a JS program, it is a function
                // We concatenate it to "var $builtinmodule = " to form a string
                // containing code that assigns the function to the variable $builtinmodule
                Sk.builtinFiles.files[path] = "var $builtinmodule = " + module;
            } else {
                // if module is a Python program, it is a string containing the text of that program
                Sk.builtinFiles.files[path] = module;
            }

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