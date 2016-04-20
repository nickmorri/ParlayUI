(function () {
    "use strict";
    
    var module_dependencies = ["parlay.data"];
    
    angular
        .module("parlay.widget.interpreter", module_dependencies)
        .factory("ParlayInterpreter", ParlayInterpreterFactory);

    ParlayInterpreterFactory.$inject = ["ParlayData"];
    function ParlayInterpreterFactory (ParlayData) {

        function extract (item) {
            return item.isPrimitive ? item.data : Object.keys(item.properties).reduce(function (accumulator, key) {
                accumulator[key] = extract(item.properties[key]);
                return accumulator;
            }, {});
        }

        function ParlayInterpreter () {
            this.functionString = undefined;
            this.namespace = {};
            this.interpreter = undefined;
        }

        ParlayInterpreter.prototype.construct = function (initFunc) {
            this.interpreter = new Interpreter(this.functionString, !!initFunc ? initFunc.bind(this) : undefined);
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
                funcRef.apply(!!funcThis ? funcThis : null, Array.prototype.slice.call(arguments).map(extract));
            });
        };

        ParlayInterpreter.prototype.makeObject = function (interpreter, objectRef) {
            var obj = interpreter.createObject();

            var prop, prop_val;
            for (prop in objectRef) {
                if (this.functionString.indexOf(prop) > -1) {
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
            }

            return obj;
        };

        ParlayInterpreter.prototype.attachFunction = function (scope, interpreter, funcRef, optionalName) {
            var name = !!optionalName ? optionalName : funcRef.name;
            
            if (this.functionString.includes(name)) {
                var func = this.makeFunction(interpreter, funcRef);
                this.registerOnNamespace(name, func.type);
                interpreter.setProperty(scope, name, func);
            }
        };

        ParlayInterpreter.prototype.attachObject = function (scope, interpreter, objectRef, optionalName) {
            var name = !!optionalName ? optionalName : objectRef.constructor.name;

            if (this.functionString.includes(name)) {
                var obj = this.makeObject(interpreter, objectRef);

                this.registerOnNamespace(name, obj.type);

                Object.keys(obj.properties).map(function (key) {
                    return {name: key, type: obj.properties[key].type};
                }).forEach(function (property) {
                    this.registerOnNamespace(property.name, property.type, name);
                }, this);

                interpreter.setProperty(scope, name, obj);
            }
        };

        ParlayInterpreter.prototype.attachItems = function (scope, interpreter, items) {
            items.forEach(function (item) {
                this.attachObject(scope, interpreter, item, item.name);
            }, this);
        };

        ParlayInterpreter.prototype.registerOnNamespace = function (name, type, parentName) {
            var container = !!this.namespace[parentName] ? this.namespace[parentName] : this.namespace;
            container[name] = type === "object" ? {} : type;
        };
        
        return ParlayInterpreter;
    }
    
}());