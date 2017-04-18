(function () {
    "use strict";

    /**
     * Provides a centralized location for items that are a data source to register themselves. Other modules can then
     * access ParlayData to retrieve all available data providers.
     * Functionally a simple wrapper for a JavaScript Map.
     * @module ParlayData
     */

    var _item_templates = {};

    angular.module("parlay.itemtypemanager", [])
        .factory("ParlayItemTypeManager", ["$injector", function ($injector) {
            var manager = {};

            manager.lookupItemType = function(type_string, default_item_factory) {
                if(!type_string) return default_item_factory(type_string);
                debugger;
                var types = type_string.split("/");
                for(var i = 0; i< types.length; i++)
                {
                    if(_item_templates[types[i]] !== undefined)
                        return _item_templates[types[i]](type_string);
                }
                return default_item_factory(type_string);
            };

            /**
             *  Register an item template with it's constructor
             * @param template
             * @param constructor
             */
            manager.registerItemType = function(template, constructor) {
                debugger;
                _item_templates[template] = constructor;
            };


            manager.registerItemTypeByName = function(template, module_name, factory_name) {
                var factoryFactory = function() {
                    debugger;
                    return angular.injector([module_name, "parlay.main"]).get(factory_name)
                };
                _item_templates[template] = factoryFactory;
            };

            return manager;
        }]);

}());