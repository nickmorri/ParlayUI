var navigation = angular.module('parlay.navigation', ['ui.router', 'ngMaterial', 'ngMdIcons', 'promenade.broker', 'parlay.protocols', 'templates-main']);

/* istanbul ignore next */
navigation.controller('parlayToolbarController', ['$scope', '$state', function ($scope, $state) {
    
    /**
	 * Returns the name of the current state from UI.Router.
	 * @returns {String} - state name
	 */
    $scope.getStateName = function () {
	    return $state.$current.self.name;
    };
    
}]);

navigation.factory('ScriptLogger',  function () {

    return {
        logCommand :  function(s) {alert('UNDEFINED');},
        logResponse: function(s) {alert('UNDEFINED');}
    };
});


/* istanbul ignore next */
navigation.controller('consoleBarController', ['$scope', '$state', 'PromenadeBroker','ScriptLogger', function ($scope, $state, PromenadeBroker,ScriptLogger) {

    $scope.consoleClass = 'console_hidden';
    $scope.consoleLog = "COMMAND LOG / CONSOLE\n";
    $scope.consoleCommand = "";
    $scope.consoleGetExpandIcon = function() {return $scope.consoleClass == 'console_expanded' ? 'expand_more' : 'expand_less';};
    $scope.consoleToggleConsole = function() {
            if($scope.consoleClass == 'console_expanded') $scope.consoleClass = 'console_hidden';
            else $scope.consoleClass = 'console_expanded';
        };
    //call this to add strings to the log
    $scope.consoleAddToLog = function (s) {$scope.consoleLog += ">>" + s + "\n";};
    $scope.consoleAddResponseToLog = function (s) {$scope.consoleLog += s + "\n";};

    $scope.consoleSendCommand = function() {
        $scope.consoleAddToLog($scope.consoleCommand);
        PromenadeBroker.sendRequest('eval_statement', {'statement': $scope.consoleCommand}).then(function (contents) {
            $scope.consoleAddResponseToLog(contents.result);
        });
        //clear out the command input
        $scope.consoleCommand = "";
    };

    //set up the script logger for other controllers to use
    ScriptLogger.logCommand = $scope.consoleAddToLog;
    ScriptLogger.logResponse = $scope.consoleAddresponseToLog;
}]);



navigation.controller('ParlayConnectionStatusController', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
    
    /* istanbul ignore next */
    $scope.viewConnections = function (event) {
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            controller: 'ParlayConnectionListController',
            templateUrl: '../parlay_components/communication/directives/parlay-connection-list-dialog.html'
        });
    };    
    
}]);

/* istanbul ignore next */
navigation.directive('parlayConnectionStatus', ['PromenadeBroker', '$mdMedia', function (PromenadeBroker, $mdMedia) {
    return {
        scope: {},
        templateUrl: '../parlay_components/navigation/directives/parlay-connection-status.html',
        controller: 'ParlayConnectionStatusController',
        link: function ($scope, element, attributes) {
	        // Watch our connection status to Broker and update the icon if connectivity changes.
	        $scope.$watch(function () {
                return PromenadeBroker.isConnected();
            }, function (connected) {
	            $scope.connected = connected;
                $scope.connection_icon = connected ? 'cloud' : 'cloud_off';
            });
            
            // Watch the size of the screen, if we are on a screen size that's greater than a small screen we should always display labels.
            $scope.$watch(function () {
	            return $mdMedia('gt-sm');
            }, function (large_screen) {
	            $scope.large_screen = large_screen;
            });
            
        }
    };
}]);

/* istanbul ignore next */
navigation.directive('parlayToolbar', function () {
    return {
        templateUrl: '../parlay_components/navigation/directives/parlay-toolbar.html',
        controller: 'parlayToolbarController'
    };
});

/* istanbul ignore next */
navigation.directive('bottomConsoleBar', function () {
    return {
        templateUrl: '../parlay_components/navigation/directives/bottom-console-bar.html',
        controller: 'consoleBarController'
    };
});