var bottom_bar = angular.module('parlay.navigation.bottombar', ['ngMaterial', 'ngMdIcons', 'promenade.broker', 'templates-main', 'angularMoment', 'luegg.directives']);

bottom_bar.factory('ScriptLogger',  function () {
    return {
        logCommand :  function(s) {
	        alert('UNDEFINED');
	    },
        logResponse: function(s) {
	        alert('UNDEFINED');
	    }
    };
});

/* istanbul ignore next */
bottom_bar.controller('ParlayConsoleBarController', ['$scope', '$timeout', 'PromenadeBroker', 'ScriptLogger', function ($scope, $timeout, PromenadeBroker, ScriptLogger) {

    $scope.console_hidden = true;
    $scope.console_log = [];
    $scope.console_command = undefined;
    $scope.console_icon = 'unfold_more';
    $scope.received_message_status_icon = 'radio_button_off';
    $scope.filtering = false;
    $scope.console_filter = undefined;
    
    $scope.consoleToggleConsole = function() {
		$scope.console_hidden = !$scope.console_hidden;
    };
    
    // Call this to add strings to the log
    $scope.consoleAddToLog = function (statement, user) {
	    $scope.console_log.push({
		    timeStamp: Date.now(),
		    statement: statement,
		    user: user
		});
	};

    $scope.consoleSendCommand = function() {
        $scope.consoleAddToLog($scope.console_command, true);
        PromenadeBroker.sendRequest('eval_statement', {'statement': $scope.console_command}).then(function (contents) {
	        $scope.received_message_status_icon = 'radio_button_on';
			$timeout(function () {
				$scope.received_message_status_icon = 'radio_button_off';
			}, 250);
            $scope.consoleAddToLog(contents.result, false);
        });
        // Clear out the command input
        $scope.console_command = undefined;
    };
    
    $scope.getConsoleLog = function () {
	    return $scope.console_log;
    };
    
    $scope.hasConsoleLog = function () {
	    return $scope.getConsoleLog().length > 0;
    };
    
    $scope.clearConsoleLog = function (event) {
	    $scope.console_log = [];
    };
    
    $scope.toggleConsoleLogFilter = function () {
	    $scope.filtering = !$scope.filtering;
	    if (!$scope.filtering) $scope.console_filter = undefined;
    };
    
    $scope.hasFilter = function () {
	    return $scope.filtering;
    };
    
    $scope.$watch('console_hidden', function (newValue) {
	    $scope.console_icon = newValue ? 'unfold_more' : 'unfold_less';
    });

    //set up the script logger for other controllers to use
    ScriptLogger.logCommand = $scope.consoleAddToLog;
    ScriptLogger.logResponse = $scope.consoleAddresponseToLog;
}]);

/* istanbul ignore next */
bottom_bar.directive('parlayBottomConsoleBar', function () {
    return {
        templateUrl: '../parlay_components/navigation/directives/parlay-bottom-console-bar.html',
        controller: 'ParlayConsoleBarController'
    };
});