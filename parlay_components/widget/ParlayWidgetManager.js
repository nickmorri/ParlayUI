(function () {
    "use strict";
    
    var module_dependencies = ["parlay.store", "parlay.settings"];
    
    angular
        .module("parlay.widget.manager", module_dependencies)
        .factory("ParlayWidgetManager", ParlayWidgetManagerFactory);

    ParlayWidgetManagerFactory.$inject = ["$window", "ParlayStore", "ParlaySettings"];
    function ParlayWidgetManagerFactory ($window, ParlayStore, ParlaySettings) {
        
        function ParlayWidgetManager () {
            this.saved_workspaces = this.getWorkspaces();
            this.active_widgets = [];
            // Add event handler before window unload to autosave widgets.
            $window.addEventListener("beforeunload", ParlayWidgetManager.prototype.autoSave.bind(this));
            this.editing = ParlaySettings.get("widgets").editing;
        }
        
        ParlayWidgetManager.prototype.toggleEditing = function () {
            this.editing = !this.editing;
            ParlaySettings.set("widgets", {editing: this.editing});
        };

        /**
         * Returns the number of widgets currently active.
         * @returns {Number} widget count
         */
        ParlayWidgetManager.prototype.countActive = function () {
            return this.getActiveWidgets().length;
        };

        /**
         * Clears reference to active widget objects.
         */
        ParlayWidgetManager.prototype.clearActive = function () {
            this.active_widgets = [];
        };

        /**
         * Returns all saved workspaces except for those that were autosaved.
         * @returns {Array} - Array of workspace objects.
         */
        ParlayWidgetManager.prototype.getSaved = function () {
            return this.saved_workspaces.filter(function (workspace) {
                return !workspace.autosave;
            });
        };

        /**
         * Returns autosaved workspace Object.
         * @returns {Object}
         */
        ParlayWidgetManager.prototype.getAutosave = function () {
            return this.saved_workspaces.find(function (workspace) {
                return workspace.autosave;
            });
        };

        /**
         * Saves the widgets active in the workspace to a workspace with the given name.
         * @param {Object} workspace - Workspace container Object.
         */
        ParlayWidgetManager.prototype.saveEntry = function (workspace) {
            workspace.data = JSON.stringify(angular.copy(this.active_widgets), function (key, value) {
                return value.constructor.name == "ParlayProtocol" ? value.protocol_name : value;
            });
            workspace.count = this.active_widgets.length;
            workspace.timestamp = new Date();
            ParlayStore("widgets").set(workspace.name, workspace);
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Loads widgets from the specified workspace.
         * @param {Object} workspace - Saved workspace to be loaded.
         */
        ParlayWidgetManager.prototype.loadEntry = function (workspace) {
            this.active_widgets = workspace.data;

            var loaded_items = workspace.data;
            var failed_items = [];

            return {
                loaded_items: loaded_items,
                failed_items: failed_items
            };
        };

        /**
         * Deletes the given saved workspace.
         * @param {String} workspace_name - Workspace name.
         */
        ParlayWidgetManager.prototype.deleteEntry = function (workspace_name) {
            ParlayStore("widgets").remove(workspace_name);
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Clears all saved workspaces
         */
        ParlayWidgetManager.prototype.clearSaved = function () {
            ParlayStore("widgets").clear();
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Returns the saved workspaces as a JSON string.
         * @returns {String} - JSON string of saved workspaces.
         */
        ParlayWidgetManager.prototype.export = function () {
            return ParlayStore("widgets").export();
        };

        /**
         * Contents of file are passed to ParlayStore once loaded.
         * @param {String} contents - JSON string of saved workspaces.
         */
        ParlayWidgetManager.prototype.import = function (contents) {
            ParlayStore("widgets").import(contents);
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Returns Object of active item containers
         * @returns {Object} key: order, value: active item containers
         */
        ParlayWidgetManager.prototype.getActiveWidgets = function () {
            return this.active_widgets;
        };

        /**
         * Checks if we currently have active items.
         * @returns {Boolean} true if we have items, false otherwise.
         */
        ParlayWidgetManager.prototype.hasActiveWidgets = function () {
            return this.countActive() > 0;
        };

        /**
         * Gets all saved workspace objects.
         * @returns {Array} - Array of workspace Objects.
         */
        ParlayWidgetManager.prototype.getWorkspaces = function () {
            var workspaces = ParlayStore("widgets").values();
            return Object.keys(workspaces).map(function (key) {
                return workspaces[key];
            }).map(function (workspace) {
                workspace.timestamp = new Date(workspace.timestamp);
                workspace.data = JSON.parse(workspace.data);
                return workspace;
            });
        };

        /**
         * Saves active widgets to a workspace titled AutoSave automatically.
         */
        ParlayWidgetManager.prototype.autoSave = function() {
            if (this.hasActiveWidgets()) {
                this.saveEntry({name: "AutoSave", data:[]});
            }
        };

        ParlayWidgetManager.prototype.add = function () {
            this.active_widgets.push({});
        };

        ParlayWidgetManager.prototype.remove = function (index) {
            this.active_widgets.splice(index, 1);
        };
        
        return new ParlayWidgetManager();
    }
    
}());