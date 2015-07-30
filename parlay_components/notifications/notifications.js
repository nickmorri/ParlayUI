var notifications = angular.module('parlay.notifiction', ['ngMaterial', 'ngMdIcons', 'notification', 'templates-main']);

notifications.run(['$notification', function ($notification) {
    // Request permissions as soon as possible.
    $notification.requestPermission();
}]);

notifications.factory('ParlayNotification', ['$mdToast', '$notification', function ($mdToast, $notification) {
    
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
            toast.action(configuration.action).highlightAction(true);
        }
        
        if (Private.hidden) {
            Private.active_notifications.push($notification(configuration.content, {
                delay: 4000
            }));
        }
        
        return $mdToast.show(toast);
    };
    
    Public.showProgress = function (configuration) {
        $mdToast.show({
            templateUrl: '../parlay_components/notifications/directives/promenade-progress-notification.html',
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