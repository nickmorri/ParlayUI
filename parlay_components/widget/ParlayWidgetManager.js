(function () {
    "use strict";
    
    var module_dependencies = ["parlay.store", "parlay.settings"];
    
    angular
        .module("parlay.widget.manager", module_dependencies)
        .factory("ParlayWidgetManager", ParlayWidgetManagerFactory);

    ParlayWidgetManagerFactory.$inject = ["$window", "ParlayStore", "ParlaySettings"];
    function ParlayWidgetManagerFactory ($window, ParlayStore, ParlaySettings) {
        
        function ParlayWidgetManager () {
            // Immediately retrieve any saved workspaces.
            this.saved_workspaces = this.getWorkspaces();
            this.active_widgets = [];
            // Add event handler before window unload to autosave widgets.
            $window.addEventListener("beforeunload", ParlayWidgetManager.prototype.autoSave.bind(this));
            this.editing = ParlaySettings.get("widgets").editing;
        }

        /**
         * Toggles the editing state and persists the state to ParlaySettings.
         */
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
                return !!value && value.constructor && value.constructor.name == "ParlayProtocol" ? value.protocol_name : value;
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
                this.saveEntry({name: "AutoSave", data:[], autosave: true});
            }
        };

        /**
         * Creates container Object for a widget and assigns it a unique ID.
         */
        ParlayWidgetManager.prototype.add = function () {

            var uid = 0;

            var active_uids = this.active_widgets.map(function (container) {
                return container.uid;
            });

            while (active_uids.indexOf(uid) !== -1) {
                uid++;
            }

            this.active_widgets.push({uid: uid});
        };

        /**
         * Removes the widget that corresponds to the given uid.
         * @param {Number} uid - Unique ID given to a widget on add.
         */
        ParlayWidgetManager.prototype.remove = function (uid) {
            this.active_widgets.splice(this.active_widgets.findIndex(function (container) {
                return container.uid === uid;
            }), 1);
        };

        /**
         * Duplicates the widget that corresponds to the given uid. The copy will be given a new uid.
         * @param {Number} old_uid - Unique ID given to widget on add.
         */
        ParlayWidgetManager.prototype.duplicate = function (old_uid) {
            var copy = angular.copy(this.active_widgets.find(function (container) {
                return container.uid === old_uid;
            }));

            var new_uid = 0;

            var active_uids = this.active_widgets.map(function (container) {
                return container.uid;
            });

            while (active_uids.indexOf(new_uid) !== -1) {
                new_uid++;
            }

            copy.uid = new_uid;

            this.active_widgets.push(copy);
        };
        
        return new ParlayWidgetManager();
    }
    
}());