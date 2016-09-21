-------------
Module System
-------------

Modules are placed in the `parlay_script_modules` directory. Within this directory, the module hierarchy is as normal for Python. Single-file modules have the module name as the file name. A module with submodules is composed of a folder with the module's name that contains a file `__init__.py` or `__init__.js` and all of its submodules. Note that there should only ever be one file with a given name, regardless of extension; if there exist two files `mymod.py` and `mymod.js`, only one will be loaded at runtime.

------
Python
------

Python modules are written as normal. In addition, they may import native Javascript modules freely and interchangeably with Python modules.


----------
JavaScript
----------

Modules may be written in Javascript either for performance reasons or to access native and application-level APIs. 
Python programs may use these modules as normal Python modules and do not differentiate between the two. 
However, it is the responsibility of the Javascript module to preserve its semantics.


**Module Structure**

Modules always have the following structure:

    function <qualified_module_name>($modname) {
        mod = {};
        ...
        return mod;
    }

`<qualified_module_name>` is the full module path with dots replaced with underscores. 
For example, for a module `parlay.foo.bar`, `<qualified_module_name>` would be `parlay_foo_bar`. 
This allows the build process to keep track of module code. 
Note that this differs slightly from the default for Skulpt. 
All other elements of module implementation remain the same.


**Writing Native Skulpt Functions**

To add a function `fizz` to a JavaScript Skulpt module, the following template is used:

    mod.fizz = new Sk.builtin.func(function(<arg1>, <arg2>, ...) {
        Sk.builtin.pyCheckArgs("fizz", arguments, <minArgs>, <maxArgs>);
        Sk.builtin.pyCheckType("<arg1>", "<arg1Type>", <test1>);
        Sk.builtin.pyCheckType("<arg2>", "<arg2Type>", <test2>);
        ...
    });

`<arg1>, <arg2>, ...` are the arguments to the function. 
The call to `Sk.builtin.pyCheckArgs` ensures that the correct number of arguments were passed to the function. 
This method can also take additional optional parameters 
([see source comments](https://github.com/skulpt/skulpt/blob/54645b5480c1a3258fa825346258374d15c1306e/src/function.js)).
The `Sk.builtin.pyCheckType` method checks the type of each argument using a user-supplied test.
There are a number of [predefined checks](https://github.com/skulpt/skulpt/blob/54645b5480c1a3258fa825346258374d15c1306e/src/function.js)
for primitives including `Sk.builtin.checkInt`, `Sk.builtin.checkNumber`, `Sk.builtin.checkFloat`, `Sk.builtin.checkBool`, and `Sk.builtin.checkString`.

In addition, for certain Python objects it is standard practice to use `instanceof` for the type check.
For example, `<arg> instanceof Sk.builtin.func` checks that `<arg>` is a Python function.
The use of these checks ensures that Python's error reporting semantics are preserved by the Javascript module.

Functions exposed by modules must return either a Python value or a [Suspension](https://github.com/skulpt/skulpt/blob/master/doc/suspensions.txt).
If a function has no return value, it should return `Sk.builtin.null.null$` to preserve Python semantics.
In general, the `Sk.ffi.remapToPy` function will correctly convert JavaScript values into Python values.
Similarly, `Sk.ffi.remapToJs` must be used to retrieve a JavaScript-accessible representation of a Python value.


