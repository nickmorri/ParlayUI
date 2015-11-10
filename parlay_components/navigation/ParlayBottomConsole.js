function ParlayScriptLoggerFactory() {
	
	function ParlayScriptLogger() {
		this.log = [];
	}
	
	ParlayScriptLogger.prototype.logCommand = function (statement, user) {
		this.log.push({
		    timeStamp: Date.now(),
		    statement: statement,
		    user: user
		});
	};
	
	ParlayScriptLogger.prototype.getLog = function () {
		return this.log;
	};
	
	ParlayScriptLogger.prototype.hasLog = function() {
		return this.getLog().length > 0;
	};
	
	ParlayScriptLogger.prototype.clearLog = function () {
		this.log = [];
	};
	
	return new ParlayScriptLogger();
}

function ParlayConsoleBarController($scope, $timeout, PromenadeBroker, ParlayScriptLogger) {

    this.console_hidden = true;
    this.console_filtering = false;
    
    this.console_command = undefined;
    this.console_icon = "unfold_more";
    this.received_message_status_icon = "radio_button_off";

    this.console_filter = undefined;
    
    this.toggleConsole = function() {
		this.console_hidden = !this.console_hidden;
    };
    
    this.consoleAddToLog = function (statement, user) {
	    ParlayScriptLogger.logCommand(statement, user);
	};
	
	this.getConsoleLog = function () {
	    return ParlayScriptLogger.getLog();
    };
    
    this.hasConsoleLog = function () {
	    return ParlayScriptLogger.hasLog();
    };

	this.clearConsoleLog = function (event) {
		ParlayScriptLogger.clearLog();
    };

    this.consoleSendCommand = function() {
	    ParlayScriptLogger.logCommand(this.console_command, true);
        
        PromenadeBroker.sendMessage({request: "eval_statement"}, {"statement": this.console_command}, {response: "eval_statement_response"}).then(function (contents) {
	        this.blinkMessageIcon();
			
			ParlayScriptLogger.logCommand(contents.result, false);
        }.bind(this));
        
        this.console_command = undefined;
    };
    
    this.blinkMessageIcon = function () {
	    this.received_message_status_icon = "radio_button_on";
	        
		$timeout(function () {
			this.received_message_status_icon = "radio_button_off";
		}.bind(this), 500);
    };
    
    this.toggleConsoleLogFilter = function () {
	    this.console_filtering = !this.console_filtering;
	    if (!this.console_filtering) this.console_filter = undefined;
    };
    
}

function ParlayBottomConsoleBar() {
    return {
	    scope: {},
        templateUrl: "../parlay_components/navigation/directives/parlay-bottom-console-bar.html",
        controller: "ParlayConsoleBarController",
        controllerAs: "ctrl"
    };
}

angular.module("parlay.navigation.bottombar", ["ngMaterial", "ngMdIcons", "promenade.broker", "templates-main", "angularMoment", "luegg.directives"])
	.factory("ParlayScriptLogger", ParlayScriptLoggerFactory)
	.controller("ParlayConsoleBarController", ["$scope", "$timeout", "PromenadeBroker", "ParlayScriptLogger", ParlayConsoleBarController])
	.directive("parlayBottomConsoleBar", ParlayBottomConsoleBar);