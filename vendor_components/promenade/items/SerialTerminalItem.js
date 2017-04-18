// Holds the module dependencies for StandardItem. Creating this Array on the Global scope allows for other modules,
// such as tabs to include themselves as StandardItem dependencies.
var standard_item_dependencies = ["promenade.items.standarditem", "parlay.items.manager", "ngOrderObjectBy", "parlay.itemtypemanager"];

(function (module_dependencies) {
    "use strict";

    /**
     * @module SerialTerminalItem
     */

    var app = angular.module("promenade.items.serialterminal", module_dependencies)
        .factory("SerialTerminalItem", SerialTerminalItemFactory);
    //register the factory in the main function
        angular.module("parlay.main").run(["ParlayItemTypeManager", function(ParlayItemTypeManager){
            debugger;
            ParlayItemTypeManager.registerItemTypeByName("SerialTerminal", "promenade.items.serialterminal", "SerialTerminalItem");
        }]);


    SerialTerminalItemFactory.$inject = ["ParlayStandardItem"];
    function SerialTerminalItemFactory(ParlayStandardItem) {

        /**
         * SerialTerminalItem extends from [ParlayItem]{@link module:ParlayItem.ParlayItem} to better accommodate
         * the discovery data provided.
         * @extends module:ParlayItem.ParlayItem
         * @constructor module:SerialTerminalItem.SerialTerminalItem
         * @param {Object} data - Discovery information to initialize the item with.
         * @param {String} data.NAME - Human readable identifier.
         * @param {String} data.ID - Unique identifier.
         * @param {Object} data.CONTENT_FIELDS - ParlayCommand(s) available to send to the SerialTerminalItem using the provided protocol.
         * @param {Object} data.PROPERTIES - ParlayPropert{y|ies} available to get and set using the provided protocol.
         * @param {Object} data.DATASTREAMS - PromenadeDatastream(s) available to listen for using the provided protocol.
         * @param {Object} protocol - Reference to the parent protocol instance.
         *
         * @example <caption>Initializing a SerialTerminalItem with discovery data.</caption>
         *
         * // discovery: Object with the discovery data needed to build the SerialTerminalItem.
         * // protocol: ParlayProtocol or a prototypical inheritor that the SerialTerminalItem is connected to.
         *
         * var item = new SerialTerminalItem(discovery, protocol);
         *
         */
        function SerialTerminalItem (data, protocol) {
            // Call our parent constructor first.
            ParlayStandardItem.call(this, data, protocol);

            this.addDirectives("toolbar", ["promenadeStandardItemCardToolbar"]);
            console.log("WOOOOOOO");
        }

        // Prototypically inherit from ParlayItem.
        SerialTerminalItem.prototype = Object.create(ParlayStandardItem.prototype);
        return SerialTerminalItem;
    }

    registerFactory.$inject = ["ParlayItemManager"];
    function registerFactory(ParlayItemManager){
        debugger;
        ParlayItemManager.registerItemTemplate("SerialTerminal", SerialTerminalItem);
    }


}(standard_item_dependencies));