(function () {
    "use strict";

    var module_dependencies = [];

    /**
     * @name worker.imports
     *
     * @description
     *
     * Mock worker.imports. Does nothing but exist to make the injector happy
     */

    angular
        .module("worker.imports", module_dependencies)
        .constant("skulpt", {})
        .constant("parlayModules",{})
        //the milisecond delay between worker pool collections
        .constant("refreshRate", 60000);

}());