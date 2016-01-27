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

function ParlayScriptBuilderController(ParlayScriptLogger, ParlayNotification) {

    this.hidden = true;

    this.toggle = function() {
		this.hidden = !this.hidden;
    };
	
	this.getLog = function () {
	    return ParlayScriptLogger.getLog();
    };

    this.clearLog = function () {
        ParlayScriptLogger.clearLog();
    };

	this.toClipboard = function () {
        var statements = this.getLog().reduce(function (previous, current) {
            return previous + "\n" + current.statement;
        }, "");

		ParlayNotification.show({content: statements.copyToClipboard() ?
            "Script builder copied to clipboard." : "Copy failed. Check browser compatibility."});
	};
    
}

function ParlayScriptBuilder() {
    return {
	    scope: {},
        templateUrl: "../parlay_components/navigation/directives/parlay-script-builder.html",
        controller: "ParlayScriptBuilderController",
        controllerAs: "ctrl"
    };
}

angular.module("parlay.navigation.scriptbuilder", ["ngMaterial", "ngMdIcons", "promenade.broker", "templates-main", "angularMoment", "luegg.directives"])
	.factory("ParlayScriptLogger", ParlayScriptLoggerFactory)
	.controller("ParlayScriptBuilderController", ["ParlayScriptLogger", "ParlayNotification", ParlayScriptBuilderController])
	.directive("parlayScriptBuilder", ParlayScriptBuilder);