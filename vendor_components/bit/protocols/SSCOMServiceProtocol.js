var bit_protocols = angular.module('bit.protocols', ['parlay.socket', 'promenade.broker']);

bit_protocols.factory('SSCOMServiceProtocol', ['SSCOM_Serial', function (SSCOM_Serial) {
    return SSCOM_Serial;    
}]);