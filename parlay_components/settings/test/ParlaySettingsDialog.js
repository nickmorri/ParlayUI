/**
 * Created by nick on 3/1/16.
 */

(function () {
    'use strict';

    describe('parlay.settings.dialog', function () {
        var ParlaySettings, scope, ctrl;

        beforeEach(module('parlay.settings.dialog'));

        beforeEach(inject(function (_ParlaySettings_, _$rootScope_, $controller) {
            ParlaySettings = _ParlaySettings_;
            scope = _$rootScope_.$new();
            ctrl = $controller("ParlaySettingsDialogController", {$scope: scope, ParlaySettings: ParlaySettings});
        }));

        describe("ParlaySettingsDialogController", function () {

        });

    });

}());