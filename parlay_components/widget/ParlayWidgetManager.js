(function () {
    "use strict";

    var module_dependencies = ["parlay.store", "parlay.settings", "parlay.item.persistence", "parlay.data"];

    var widgetLastZIndex = {
        value: 0
    };

    angular
        .module("parlay.widget.manager", module_dependencies)
        .value("widgetLastZIndex", widgetLastZIndex)
        .factory("ParlayWidgetManager", ParlayWidgetManagerFactory);

    ParlayWidgetManagerFactory.$inject = ["$window", "ParlayStore", "ParlaySettings", "widgetLastZIndex", "ParlayItemPersistence", "ParlayData"];
    function ParlayWidgetManagerFactory ($window, ParlayStore, ParlaySettings, widgetLastZIndex, ParlayItemPersistence, ParlayData) {

        /**
         * Manages [ParlayWidgetBase]{@link module:ParlayWidget.ParlayWidgetBase}s active in the workspace.
         * Interacts with [ParlayStore]{@link module:ParlayStore.ParlayStore} to retrieve any previous workspace
         * sessions.
         * @constructor module:ParlayWidget.ParlayWidgetManager
         * @param {Object} $window - AngularJS [$window]{@link https://docs.angularjs.org/api/ng/service/$window} service.
         * @param {Object} ParlayStore - Parlay [ParlayStore]{@link module:ParlayStore.ParlayStoreService} service.
         * @param {Object} ParlaySettings - Parlay [ParlaySettings]{@link module:ParlayStore.ParlayStore#store} service.
         * @param {Object} widgetLastZIndex - injected value for tracking the last used zIndex.
         */
        function ParlayWidgetManager () {

            /**
             * Immediately retrieve any saved workspaces.
             * @member module:ParlayWidget.ParlayWidgetManager#saved_workspaces
             * @public
             * @type {Array}
             */
            this.saved_workspaces = this.getWorkspaces();

            /**
             * Container for all currently active ParlayWidgets.
             * @member module:ParlayWidget.ParlayWidgetManager#active_widgets
             * @public
             * @type {Array}
             */
            this.active_widgets = [];

            /**
             * If true the user can move, add, and remove widgets.
             * Restores the state of the previous session to current session.
             * @member module:ParlayWidget.ParlayWidgetManager#editing
             * @public
             * @type {Boolean}
             */
            this.editing = ParlaySettings.get("widgets").editing;

            // Add event handler before window unload to autosave widgets.
            $window.addEventListener("beforeunload", ParlayWidgetManager.prototype.autoSave.bind(this));
        }

        /**
         * Toggles the editing state and persists the state to ParlaySettings.
         * @member module:ParlayWidget.ParlayWidgetManager#
         * @public
         */
        ParlayWidgetManager.prototype.toggleEditing = function () {
            this.editing = !this.editing;
            ParlaySettings.set("widgets", {editing: this.editing});
        };

        /**
         * Returns the number of widgets currently active.
         * @member module:ParlayWidget.ParlayWidgetManager#
         * @public
         * @returns {Number} widget count
         */
        ParlayWidgetManager.prototype.countActive = function () {
            return this.getActiveWidgets().length;
        };


        /**
         * Clears reference to active widget objects.
         * @member module:ParlayWidget.ParlayWidgetManager#
         * @public
         */
        ParlayWidgetManager.prototype.clearActive = function () {
            this.active_widgets = [];
            ParlayData.set("widget_left_position", 5);
            ParlayData.set("widget_top_position", 5);
            ParlayData.set('widget_iterations', 1);
        };

        ParlayWidgetManager.prototype.getActiveWidget = function (uid) {
            for(var i =0; i< this.active_widgets.length; i++)
            {
                if(this.active_widgets[i].uid == uid) return this.active_widgets[i];
            }
        };


        /**
         * Returns all saved workspaces except for those that were autosaved.
         * @member module:ParlayWidget.ParlayWidgetManager#getSaved
         * @public
         * @returns {Array} - Array of workspace objects.
         */
        ParlayWidgetManager.prototype.getSaved = function () {
            return this.saved_workspaces.filter(function (workspace) {
                return !workspace.autosave;
            });
        };

        /**
         * Returns autosaved workspace Object.
         * @member module:ParlayWidget.ParlayWidgetManager#getAutosave
         * @public
         * @returns {Object}
         */
        ParlayWidgetManager.prototype.getAutosave = function () {
            return this.saved_workspaces.find(function (workspace) {
                return workspace.autosave;
            });
        };

        /**
         * Saves the widgets active in the workspace to a workspace with the given name.
         * @member module:ParlayWidget.ParlayWidgetManager#saveEntry
         * @public
         * @param {Object} workspace - Workspace container Object.
         */
        ParlayWidgetManager.prototype.saveEntry = function (workspace) {

            // Copy active widgets so that when we sort and modify indices we aren't modifying the active widgets.

            var copy = angular.copy(this.active_widgets);

            // Sort the widgets by their zIndex and compact the zIndices so that they don't get too big.
            angular.copy(this.active_widgets).sort(function (widget1, widget2) {
                return widget1.zIndex - widget2.zIndex;
            }).forEach(function (element, index) {

                var toSave = copy.find(function (widget) {
                    return widget.uid === element.uid;
                });
                toSave.zIndex = index + 1;

                if (!!element.type && element.type === "StandardItem"){
                    var directive = "parlayItemCard." + element.id + "_" + element.uid;
                    var stored_values = ParlayItemPersistence.collectDirective(directive);
                    toSave.stored_values = stored_values;
                }

            });

            workspace.data = JSON.stringify(copy, function (key, value) {
                return !!value && value.constructor && value.constructor.name == "ParlayProtocol" ? value.protocol_name : value;
            });

            workspace.count = copy.length;
            workspace.timestamp = new Date();

            ParlayStore("widgets").set(workspace.name, workspace);
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Loads widgets from the specified workspace.
         * @member module:ParlayWidget.ParlayWidgetManager#loadEntry
         * @public
         * @param {Object} workspace - Saved workspace to be loaded.
         */
        ParlayWidgetManager.prototype.loadEntry = function (workspace) {

            var next_uid = 0;

            // Locate the highest zIndex.
            widgetLastZIndex.value = this.active_widgets.reduce(function (greatest_index, current_widget) {
                return greatest_index > current_widget.zIndex ? greatest_index : parseInt(current_widget.zIndex, 10);
            }, 0);

            widgetLastZIndex.value = workspace.data.reduce(function (greatest_index, current_widget) {
                return greatest_index > current_widget.zIndex ? greatest_index : parseInt(current_widget.zIndex, 10);
            }, widgetLastZIndex.value);

            // Collect all UIDs in use.
            var uids_in_use = this.active_widgets.map(function (widget) {
                return widget.uid;
            });

            this.active_widgets = workspace.data.map(function (widget) {

                // If the widget's uid is already in use assign it another.
                if (uids_in_use.indexOf(widget.uid) > -1) {
                    // Ensure that the uid we generate isn't in use.
                    while (uids_in_use.indexOf(next_uid) > -1) {
                        next_uid++;
                    }
                    // Record the new uid that was generated.
                    uids_in_use.push(next_uid);
                    widget.uid = next_uid;
                }

                return widget;
            });

            var loaded_items = this.active_widgets;
            var failed_items = [];

            return {
                loaded_items: loaded_items,
                failed_items: failed_items
            };
        };

        /**
         * Deletes the given saved workspace.
         * @member module:ParlayWidget.ParlayWidgetManager#deleteEntry
         * @public
         * @param {String} workspace_name - Workspace name.
         */
        ParlayWidgetManager.prototype.deleteEntry = function (workspace_name) {
            ParlayStore("widgets").remove(workspace_name);
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Clears all saved workspaces
         * @member module:ParlayWidget.ParlayWidgetManager#clearSaved
         * @public
         */
        ParlayWidgetManager.prototype.clearSaved = function () {
            ParlayStore("widgets").clear();
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Returns the saved workspaces as a JSON string.
         * @member module:ParlayWidget.ParlayWidgetManager#export
         * @public
         * @param {Object} contents - Object containing saved workspaces.
         */
        ParlayWidgetManager.prototype.export = function () {
            return ParlayStore("widgets").export();
        };

        /**
         * Contents of file are passed to ParlayStore once loaded.
         * @member module:ParlayWidget.ParlayWidgetManager#import
         * @public
         * @param {String} contents - JSON string of saved workspaces.
         */
        ParlayWidgetManager.prototype.import = function (contents) {
            ParlayStore("widgets").import(contents);
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Returns Object of active item containers
         * @member module:ParlayWidget.ParlayWidgetManager#getActiveWidgets
         * @public
         * @returns {Object} key: order, value: active item containers
         */
        ParlayWidgetManager.prototype.getActiveWidgets = function () {
            return this.active_widgets;
        };

        /**
         * Checks if we currently have active items.
         * @member module:ParlayWidget.ParlayWidgetManager#hasActiveWidgets
         * @public
         * @returns {Boolean} true if we have items, false otherwise.
         */
        ParlayWidgetManager.prototype.hasActiveWidgets = function () {
            return this.countActive() > 0;
        };

        /**
         * Gets all saved workspace objects.
         * @member module:ParlayWidget.ParlayWidgetManager#getWorkspaces
         * @public
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
         * @member module:ParlayWidget.ParlayWidgetManager#autoSave
         * @public
         */
        ParlayWidgetManager.prototype.autoSave = function() {
            if (this.hasActiveWidgets()) {
                this.saveEntry({name: "AutoSave", data:[], autosave: true});
            }
        };


        /**
         * generates an unused UID to assigned to a new widget
         * @returns {number}
         */
        ParlayWidgetManager.prototype.generateUID = function () {
            var uid = 0;

            var active_uids = this.active_widgets.map(function (container) {
                return container.uid;
            });

            while (active_uids.indexOf(uid) !== -1) {
                uid++;
            }

            return uid;
        };


        /**
         * Creates container Object for a widget and assigns it a unique ID.
         * @member module:ParlayWidget.ParlayWidgetManager#add
         * @public
         * @param {String} type - type of the widget.  Either StandardWidget or StandardItem
         * @param {item} [item] - item ID of a parlay item. OR a widget template.
         */
        ParlayWidgetManager.prototype.add = function (type, item) {
            var uid = this.generateUID();
            var new_widget ={uid: uid, zIndex: ++widgetLastZIndex.value, type: type};

            if (!!item) {
                if (type === "StandardItem") {
                    new_widget.item = item;
                } else if (type === "StandardWidget") {
                    new_widget.widget = item;
                }
            }

            this.active_widgets.push(new_widget);
        };

        /**
         * Removes the widget that corresponds to the given uid.
         * @member module:ParlayWidget.ParlayWidgetManager#remove
         * @public
         * @param {Number} uid - Unique ID given to a widget on add.
         */
        ParlayWidgetManager.prototype.remove = function (uid) {
            this.active_widgets.splice(this.active_widgets.findIndex(function (container) {
                return container.uid === uid;
            }), 1);
        };

        /**
         * Duplicates the widget that corresponds to the given uid. The copy will be given a new uid.
         * @member module:ParlayWidget.ParlayWidgetManager#duplicate
         * @public
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

            // TODO: Not following best practices here by mixing model management and view definition here.
            // If possible this should be moved down to be a directive responsibility.
            copy.zIndex = ++widgetLastZIndex.value;

            // Shift a few pixels over so that the duplicate widget doesn't completely overlap the original so that the
            // user is aware a new widget has been created.

            copy.position.left = (parseInt(copy.position.left, 10) + 20) + "px";
            copy.position.top = (parseInt(copy.position.top, 10) + 20) + "px";

            this.active_widgets.push(copy);
        };

        return new ParlayWidgetManager();
    }

}());