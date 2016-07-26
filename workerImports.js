(function () {
    "use strict";

    var module_dependencies = [];

    function initSkulpt() {
        @@importSkulpt // jshint ignore:line
    }

    function initParlayModules() {
        Sk.externalLibraries = {};

        // format and add the necessary information for Skulpt to use this module
        function registerModule(path, name, module, ext) {

            var fileText;

            // embed the actual code inside the js wrapper
            if (ext === "js") {
                fileText = "var $builtinmodule = " + module;
                // ("" + module) returns the code of module as a string
                module = {funcname: module.name, code: "" + module};
            } else {
                fileText = module;
                try {
                    module = Sk.compile(module, path, "exec", true);
                } catch (err) {
                    self.postMessage({messageType:"error", value: err.toString() + " in module " + name});
                }
            }

            // register this module
            Sk.externalLibraries[name] = {
                path: path,
                // since we're loading all of our own modules locally,
                // we shouldn't need to list dependencies
                dependencies: [],
                type: ext
            };
            // pre-cache the module since there is no file for it
            // Skulpt will check the cache first and never look for the file via HTTP request
            Sk.externalLibraryCache[name] = module;

            // add the file to the builtin files
            // this makes the file available to Sk.read()
            Sk.builtinFiles = Sk.builtinFiles || {};
            Sk.builtinFiles.files = Sk.builtinFiles.files || {};
            Sk.builtinFiles.files[path] = fileText;

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