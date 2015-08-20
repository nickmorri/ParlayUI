var notifications = angular.module('parlay.notification', ['ngMaterial', 'notification', 'templates-main']);

notifications.run(['$notification', function ($notification) {
    // Request permissions as soon as possible.
    $notification.requestPermission();
}]);

notifications.factory('ParlayNotification', ['$mdToast', '$q', '$notification', function ($mdToast, $q, $notification) {
    
    function pageVisibile() {
        return document.hidden;
    }
    
    function visibilityChangeHandler() {
        Private.hidden = pageVisibile();
        Private.clearNotifications();
    }
    
    var Public = {};
    
    var Private = {
        hidden: pageVisibile(),
        active_notifications: []
    };
    
    Public.show = function (configuration) {
        var toast = $mdToast.simple().content(configuration.content);
        
        if (configuration.action) {
            toast.action(configuration.action.text).highlightAction(true);
        }
        
        if (Private.hidden) {
            Private.active_notifications.push($notification(configuration.content, {
                delay: 4000
            }));
        }
        
        $mdToast.show(toast).then(function (result) {
            // Result will be resolved with 'ok' if the action is performed and true if the $mdToast has hidden.
            if (result === 'ok' && configuration.action) configuration.action.callback();
        });
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
    
    document.addEventListener('visibilitychange', visibilityChangeHandler);
    
    return Public;
}]);