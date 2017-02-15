(function () {
   "use strict";

   var module_dependencies = ["parlay.widget.collection", "parlay.widget.manager"];

   angular
       .module("parlay.widget.search", module_dependencies)
       .directive("parlayWidgetLibrarySidenav", ParlayWidgetLibrarySidenav)
       .controller("ParlayWidgetSearchController", ParlayWidgetSearchController);

   ParlayWidgetSearchController.$inject = ["$scope", "$mdSidenav", "ParlayWidgetCollection", "ParlayWidgetManager"];
   function ParlayWidgetSearchController($scope, $mdSidenav, ParlayWidgetCollection, ParlayWidgetManager) {
       var ctrl = this;

       ctrl.querySearch = querySearch;
       ctrl.closeSearch = closeSearch;
       ctrl.selectWidget = selectWidget;

       $scope.search_text = null;
       $scope.selected_widget = null;

       function querySearch(query) {
           if (query !== null && query !== undefined) {
               query = query.toLowerCase();
           }

           function compare(widget1, widget2) {
               return widget1.display_name.toLowerCase() > widget2.display_name.toLowerCase();
           }

           function matchWidget(widget) {
               return widget.display_name.toLowerCase().includes(query);
           }

           var widgets = ParlayWidgetCollection.getAvailableWidgets().sort(compare);

           return query ? widgets.filter(matchWidget) : widgets;
       }

       function closeSearch() {
           $mdSidenav('parlay-widget-library').toggle();
       }

       function selectWidget(widget) {
           if (widget === null || widget === undefined) {
               return;
           }

           $scope.search_text = null;
           $scope.selected_widget = null;

           if (!$mdSidenav("navigation").isLockedOpen()) {
               $mdSidenav("navigation").close();
           }

           ParlayWidgetManager.add("StandardWidget", widget);
       }


   }

   function ParlayWidgetLibrarySidenav() {
       return {
           restrict: "E",
           templateUrl: "../parlay_components/widget/directives/parlay-widget-library-sidenav.html",
           controller: "ParlayWidgetSearchController",
           controllerAs: "widgetNav"
       };
   }
}());