var notifications = angular.module('parlay.notification', ['ngMaterial', 'notification', 'templates-main']);

notifications.run(['$notification', function ($notification) {
    // Request permissions as soon as possible.
    $notification.requestPermission();
}]);

notifications.factory('ParlayNotification', ['$mdToast', '$q', '$notification', '$timeout', function ($mdToast, $q, $notification, $timeout) {
            
    var Public = {};
    
    var Private = {
        active_notifications: [],
        timeout: undefined
    };
    
    Public.show = function (configuration) {
	    
	    var toast = $mdToast.simple()
	    	.content(configuration.content)
	    	.hideDelay(false);
        
        if (configuration.action) toast
            	.action(configuration.action.text)
            	.highlightAction(true);
        
        if (document.hidden) {
	        var notification = $notification(configuration.content);
            Private.active_notifications.push(notification);
        }
        
        $mdToast.show(toast).then(function (result) {
            // Result will be resolved with 'ok' if the action is performed and true if the $mdToast has hidden.
            if (result === 'ok' && configuration.action) configuration.action.callback();
        });
        
        if (Private.timeout !== undefined) $timeout.cancel(Private.timeout);
        
        Private.timeout = $timeout(function () {
	        Public.hide();
	        if (notification !== undefined) notification.close();
        }, 4000);
    };
    
    Public.hide = function () {
	    $mdToast.hide();
    };
    
    Public.showProgress = function (configuration) {
        $mdToast.show({
            template: '<md-toast><md-progress-linear flex class="notification-progress" md-mode="indeterminate"></md-progress-linear></md-toast>',
            hideDelay: false    
        });        
    };
    
    Public.hideProgress = function () {
        $mdToast.hide();
    };
    
    Private.clearNotifications = function () {
        Private.active_notifications.forEach(function (notification) {
            notification.close();
        });
    };
    
    document.addEventListener('visibilitychange', Private.clearNotifications);
    
    return Public;
}]);