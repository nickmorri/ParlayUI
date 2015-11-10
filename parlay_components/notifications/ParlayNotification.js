/**
 * General use of ParlayNotification.
 *
 * ParlayNotification.show({content: "Text you want to display."});
 *
 * With action button.
 *
 * ParlayNotification.show({
 *      content: "Text you want to display.",
 *	    action: {
 *		    text: "Text that the action button displays.",
 *		    callback: "Function to invoke when Toast action is clicked."
 *	    }
 *  });
 */

function RunNotification($notification) {
    // Request permissions as soon as possible.
    $notification.requestPermission();
}

function ParlayNotificationFactory($mdToast, $q, $notification, $timeout, NotificationDisplayDuration) {
	
	var instance;
	
	var toast_active = false;
	
	var pending_toasts = [];
	var active_browser_notifications = [];
	
	// Clear browser notifications if visibility of the document changes.
    document.addEventListener('visibilitychange', function clearNotifications() {
        active_browser_notifications.forEach(function (notification) {
            notification.close();
        });
    });
	
	/**
	 * Displays the next available toast. 
	 * Then if more toasts are available display then next as well as call the callback if the $mdToast was resolved by user action.
	 */
	function displayToast() {
	    toast_active = true;
	    var next_toast = pending_toasts.shift();
	    $mdToast.show(next_toast.toast).then(function (result) {
            // If there are pending toasts remaining display the next toast.
            if (pending_toasts.length) displayToast();
	        toast_active = false;
            // Result will be resolved with 'ok' if the action is performed and true if the $mdToast has hidden.
            if (result === 'ok' && next_toast.callback) next_toast.callback();            
        });
    }
    
    /**
	 * Creates $mdToast and shows it whenever we can, if nothing is currently shown show now otherwise show when no toast are being shown.
	 * @param {Object} configuration - Notification configuration object.
	 */
    function prepToast(configuration) {
	    var toast = $mdToast.simple().content(configuration.content).hideDelay(NotificationDisplayDuration);
        
        if (configuration.action) {
	        toast.action(configuration.action.text).highlightAction(true);
	        
	        pending_toasts.push({
		        toast: toast,
		        callback: configuration.action.callback
	        });
        }
        else {
	        pending_toasts.push({toast: toast});
        }
        
        if (!toast_active) displayToast();        
        
    }
    
    /**
	 * Creates $notification (HTML5 Notifications API) and stores a reference that can be cleared later.
	 * @param {Object} configuration - Notification configuration object.
	 */
    function prepBrowserNotification(configuration) { 
        active_browser_notifications.push($notification(configuration.content, {
	        delay: NotificationDisplayDuration
        }));
    }
    
    return {
	    /**
		 * Creates Toast and if the browser window is currently hidden a HTML5 Notification.
		 * @param {Object} configuration - Notification configuration object.
		 *
		 * {
		 *      content: "Text you want to display."
		 *	    action: {
		 *		    text: "Text that the action button displays.",
		 *		    callback: "Function to invoke when Toast action is clicked."
		 *	    }
		 *  }
		 *
		 */
		show: function (configuration) {	    
		    prepToast(configuration);
		    
		    if (document.hidden) prepBrowserNotification(configuration);        
	    },
	    showProgress: function () {
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
	.factory('ParlayNotification', ['$mdToast', '$q', '$notification', '$timeout', "NotificationDisplayDuration", ParlayNotificationFactory]);