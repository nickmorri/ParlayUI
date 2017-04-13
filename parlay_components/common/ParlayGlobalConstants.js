(function() {
    "use strict";

    var module_dependencies = [];

    angular
        .module("parlay.common.constants", module_dependencies)
        .constant("HTTPPort", "58080")
        .constant("HTTPSPort", "58081")
        .constant("WebsocketPort", "58085")
        .constant("SecureWebsocketPort", "58086");
}());