(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module('mock.parlay.items.manager', module_dependencies)
        .factory('ParlayItemManager', MockParlayItemManager);

    function MockParlayItemManager() {
        return {
            getActiveItems: function () {
                return [];
            },
            activateItem: function(item) {},
            hasActiveItems: function () {
                return false;
            },
            getAvailableItems: function() {
                return [
                    {
                        name: "test",
                        matchesQuery: function () {
                            return true;
                        }
                    },
                    {
                        name: "test1",
                        matchesQuery: function () {
                            return true;
                        }
                    },
                    {
                        name: "",
                        matchesQuery: function () {
                            return false;
                        }
                    }
                ];
            },
            reorder: function(index, distance) {
                //
            },
            duplicateItem: function (index) {
                //
            },
            deactivateItem: function (index) {
                //
            }
        };
    }

}());