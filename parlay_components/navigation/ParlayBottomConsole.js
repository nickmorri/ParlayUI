function ScriptLogger() {
    return {
        logCommand :  function(s) {
	        alert('UNDEFINED');
	    },
        logResponse: function(s) {
	        alert('UNDEFINED');
	    }
    };
}

function ParlayConsoleBarController($scope, $timeout, PromenadeBroker, ScriptLogger) {

    var console_hidden = true;
    var console_log = [];
    var console_filtering = false;
    
    $scope.console_command = undefined;
    $scope.console_icon = 'unfold_more';
    $scope.received_message_status_icon = 'radio_button_off';

    $scope.console_filter = undefined;
    
    $scope.toggleConsole = function() {
		console_hidden = !console_hidden;
		$scope.console_icon = console_hidden ? 'unfold_more' : 'unfold_less';
    };
    
    $scope.isConsoleHidden = function () {
	    return console_hidden;
    };
    
    // Call this to add strings to the log
    $scope.consoleAddToLog = function (statement, user) {
	    console_log.push({
		    timeStamp: Date.now(),
		    statement: statement,
		    user: user
		});
	};
	
	$scope.getConsoleLog = function () {
	    return console_log;
    };
    
    $scope.hasConsoleLog = function () {
	    return $scope.getConsoleLog().length > 0;
    };

	$scope.clearConsoleLog = function (event) {
		console_log = [];
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
    
    
    
    $scope.toggleConsoleLogFilter = function () {
	    console_filtering = !console_filtering;
	    if (!console_filtering) $scope.console_filter = undefined;
    };
    
    $scope.hasConsoleLogFilter = function () {
	    return console_filtering;
    };

    // Set up the ScriptLogger for other controllers to use.
    ScriptLogger.logCommand = $scope.consoleAddToLog;
    ScriptLogger.logResponse = $scope.consoleAddresponseToLog;
}

function ParlayBottomConsoleBar() {
    return {
        templateUrl: '../parlay_components/navigation/directives/parlay-bottom-console-bar.html',
        controller: 'ParlayConsoleBarController'
    };
}

angular.module('parlay.navigation.bottombar', ['ngMaterial', 'ngMdIcons', 'promenade.broker', 'templates-main', 'angularMoment', 'luegg.directives'])
	.factory('ScriptLogger', ScriptLogger)
	.controller('ParlayConsoleBarController', ['$scope', '$timeout', 'PromenadeBroker', 'ScriptLogger', ParlayConsoleBarController])
	.directive('parlayBottomConsoleBar', ParlayBottomConsoleBar);