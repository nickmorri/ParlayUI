function RunNotification($notification) {
    // Request permissions as soon as possible.
    $notification.requestPermission();
}

function ParlayNotification($mdToast, $q, $notification, $timeout, NotificationDisplayDuration) {
            
    var active_notifications = [];
    var timeout;
    
    function clearNotifications() {
        active_notifications.forEach(function (notification) {
            notification.close();
        });
    }
    
    document.addEventListener('visibilitychange', clearNotifications);
    
    return {
	    show: function (configuration) {	    
		    var toast = $mdToast.simple()
		    	.content(configuration.content)
		    	.hideDelay(NotificationDisplayDuration);
	        
	        if (configuration.action) toast
	            	.action(configuration.action.text)
	            	.highlightAction(true);
	        
	        if (document.hidden) {
		        var notification = $notification(configuration.content);
	            active_notifications.push(notification);
	        }
	        
	        $mdToast.show(toast).then(function (result) {
	            // Result will be resolved with 'ok' if the action is performed and true if the $mdToast has hidden.
	            if (result === 'ok' && configuration.action) configuration.action.callback();
	        });
	        
	        if (timeout !== undefined) $timeout.cancel(timeout);
	        
	        timeout = $timeout(function () {
		        if (notification !== undefined) notification.close();
	        }, NotificationDisplayDuration);
	    },
	    showProgress: function (configuration) {
	        $mdToast.show({
	            template: '<md-toast><md-progress-linear flex class="notification-progress" md-mode="indeterminate"></md-progress-linear></md-toast>',
	            hideDelay: false
	        });
	    },
	    hideProgress: function () {
	        $mdToast.hide();
	    }
    };
}

angular.module('parlay.notification', ['ngMaterial', 'notification', 'templates-main'])
	.run(['$notification', RunNotification])
	.value("NotificationDisplayDuration", 4000)
	.factory('ParlayNotification', ['$mdToast', '$q', '$notification', '$timeout', "NotificationDisplayDuration", ParlayNotification]);