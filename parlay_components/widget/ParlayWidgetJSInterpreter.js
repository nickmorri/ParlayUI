(function () {
    "use strict";
    
    var module_dependencies = ["parlay.data", "parlay.socket"];
    
    angular
        .module("parlay.widget.interpreter", module_dependencies)
        .factory("ParlayInterpreter", ParlayInterpreterFactory);

    ParlayInterpreterFactory.$inject = ["ParlayData", "ParlaySocket"];
    function ParlayInterpreterFactory (ParlayData, ParlaySocket) {

        function df_extract (item) {
            return item.isPrimitive ? item.data : Object.keys(item.properties).reduce(function (accumulator, key) {
                accumulator[key] = df_extract(item.properties[key]);
                return accumulator;
            }, {});
        }

        function ParlayInterpreter () {
            this.functionString = undefined;
            this.interpreter = undefined;
        }

        ParlayInterpreter.prototype.construct = function (childInitFunc) {
                this.interpreter = new Interpreter(this.functionString, function (interpreter, scope) {

                    this.attachObject(scope, interpreter, ParlaySocket);
                    this.attachItems(scope, interpreter, this.getItems());
                    this.attachFunction(scope, interpreter, alert);
                    this.attachFunction(scope, interpreter, console.log.bind(console), "log");

                    if (!!childInitFunc) {
                        childInitFunc.call(this, interpreter, scope);
                    }

                }.bind(this));
        };

        ParlayInterpreter.prototype.run = function () {
            this.interpreter.run();
            return this.interpreter.value.data;
        };

        ParlayInterpreter.prototype.getItems = function () {
            var iterator = ParlayData.values();
            var values = [];
            for (var current = iterator.next(); !current.done; current = iterator.next()) {
                values.push(current.value);
            }
            return values;
        };

        ParlayInterpreter.prototype.makeFunction = function (interpreter, funcRef, funcThis) {
            return interpreter.createNativeFunction(function () {
                funcRef.apply(!!funcThis ? funcThis : null, Array.prototype.slice.call(arguments).map(df_extract));
            });
        };

        ParlayInterpreter.prototype.makeObject = function (interpreter, objectRef) {
            var obj = interpreter.createObject();

            var prop, prop_val;
            for (prop in objectRef) {
                prop_val = objectRef[prop];
                if (typeof prop_val == "function") {
                    interpreter.setProperty(obj, prop_val.name, this.makeFunction(interpreter, prop_val, objectRef));
                }
                else if (["string", "number", "boolean"].indexOf(typeof prop_val) > -1) {
                    interpreter.setProperty(obj, prop, interpreter.createPrimitive(prop_val));
                }
                else if (prop_val === null) {
                    interpreter.setProperty(obj, prop, interpreter.createPrimitive(null));
                }
            }

            return obj;
        };

        ParlayInterpreter.prototype.attachFunction = function (scope, interpreter, funcRef, optionalName) {
            var name = !!optionalName ? optionalName : funcRef.name;
            
            if (this.functionString.includes(name)) {
                interpreter.setProperty(scope, name, this.makeFunction(interpreter, funcRef));
            }
        };

        ParlayInterpreter.prototype.attachObject = function (scope, interpreter, objectRef, optionalName) {
            var name = !!optionalName ? optionalName : objectRef.constructor.name;

            if (this.functionString.includes(name)) {
                interpreter.setProperty(scope, name, this.makeObject(interpreter, objectRef));
            }
        };

        ParlayInterpreter.prototype.attachItems = function (scope, interpreter, items) {
            items.forEach(function (item) {
                this.attachObject(scope, interpreter, item, item.name);
            }, this);
        };

        ParlayInterpreter.toJSON = function () {
            return {
                functionString: this.functionString
            };
        };
        
        return ParlayInterpreter;
    }
    
}());