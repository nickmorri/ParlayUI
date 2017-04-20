(function(){
    "use strict";

    var module_dependencies = ["promenade.broker", "parlay.utility"];

    angular
        .module("parlay.logs.logdialog", module_dependencies)
        .controller("ParlayLogsDialogController", ParlayLogsDialogController)
        .directive("parlayLogItem", ParlayLogItem);


    ParlayLogsDialogController.$inject = ["$scope", "$mdDialog", "PromenadeBroker", "ParlayObject"];
    function ParlayLogsDialogController(scope, $mdDialog, PromenadeBroker, ParlayObject) {

        var ctrl = this;
        ctrl.queryLogs = queryLogs;
        ctrl.downloadLogs = downloadLogs;
        ctrl.toggle = toggle;
        ctrl.hide = $mdDialog.hide;

        scope.logQueryText = "";
        scope.reverse = false;

        function queryLogs() {
            function buildFilterOn(query) {
                var lowercase_query = angular.lowercase(query);

                return function (message) {

                    var matches_topics = Object.keys(message.TOPICS).some(function (key) {
                        return !!message.TOPICS[key] && angular.lowercase(message.TOPICS[key].toString()).indexOf(lowercase_query) > -1;
                    });

                    var matches_contents = Object.keys(message.CONTENTS).some(function (key) {
                        return !!message.CONTENTS[key] && angular.lowercase(message.CONTENTS[key].toString()).indexOf(lowercase_query) > -1;
                    });

                    return matches_topics || matches_contents;

                };
            }
            var query = scope.logQueryText;
            // If the filter_text isn't null or undefined return the messages that match the query.
            var log = !!query ? PromenadeBroker.getLogs().filter(buildFilterOn(query)) : PromenadeBroker.getLogs();
            return scope.reverse ? log.reverse() : log;
        }

        function downloadLogs() {
            var download = new ParlayObject(queryLogs());
            var filename = "ParlayLogs"  + "_" + (new Date().toISOString()) + ".txt";
            download.download(filename);
        }

        function toggle() {
            scope.reverse = !scope.reverse;
        }
    }

    ParlayLogItem.$inject = [];
    function ParlayLogItem() {
        return {
            restrict: "E",
            templateUrl: "../parlay_components/logs/directives/parlay-log-item.html",
            scope: {
                message: "="
            }
        };
    }

}());