------
Guides and References
------

#### References

- As a general Web reference the [Mozilla Developer Network]{@link https://developer.mozilla.org/en-US/docs/Web}
has some of the best tutorials, references, and explanations of HTML, CSS and JavaScript as well as other Web APIs.
  
- For **AngularJS** reference the official documentation is generally the best source of accurate and up to date 
information. [API specifications]{@link https://docs.angularjs.org/api}, a 
[developer guide]{@link https://docs.angularjs.org/guide} and a [tutorial]{@link https://docs.angularjs.org/tutorial} are
available.

- For **Angular Material** reference the [official documentation]{@link https://material.angularjs.org/latest/} is generally
the best source of accurate and up to date information.
 
- During development of ParlayUI this [style guide]{@link https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md} 
was loosely following to keep some semblance of consistent syntax.

#### Tips

AngularJS, Angular Material and JavaScript have some quirks that can leave someone unacquainted scratching their heads.
Provided below are some guides and references that may be useful.

- [JavaScript equality comparisons]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness}

JavaScript == is not the same as {C++, Python, Java, etc} ==. In JavaScript == will compare both values after conversion
to a common type. There are very few times when you will want to use the loose equality operator (==), as a rule use 
strict equality (===) unless you are sure loose equality comparison is desired.

```
"0" == 0 // true
"0" === 0 // false
```

- [JavaScript var hoisting]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var#var_hoisting}

JavaScript variable declarations are hoisted to the top of their Function or global code. 

- [JavaScript prototypical inheritance]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain}

JavaScript inheritance works between Objects and their prototype property. It is not like classical inheritance, and 
shouldn't be forced to behave exactly the same.
 
Additional reading: [MSDN Magazine Blog]{@link https://msdn.microsoft.com/en-us/magazine/ff852808.aspx}

- [JavaScript first-class Function Objects]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions}
 
In JavaScript Functions are first-class Objects. This means that they can have properties and methods like other Objects.
Objects and Functions are distinct in the sense that Functions can be called.
 
- [Strict mode]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode}

```"use strict";```

Instructs the JavaScript interpreter to enter strict mode. This forces some errors that may be normally silent to be 
throw errors. If can also allow the JavaScript interpreter engine to perform some optimizations that are otherwise not 
possible.

 
- [Immediately-Invoked Function Expression]{@link http://benalman.com/news/2010/11/immediately-invoked-function-expression/}  

```
(function () {
    // Statements
}());
```

Immediately-Invoked Function Expressions are used throughout ParlayUI to prevent variables from leaking onto the Global
scope. This is because variables and Functions declared within a Function are accessible only from within that Function.
This pattern not only keeps variables from leaking on the the Global scope but also allows for variables to be "private"
to a module.

- [JavaScript Closures]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures}

```
var person = function () {
    var age = 21;
    
    return {
        getAge: function () {
            return age;
        },
        haveBirthday: function () {
            age = age + 1;
        }
    }; 
}();

console.log(person.getAge()); // 21
person.haveBirthday();
console.log(person.getAge()); // 22
console.log(person.age); // undefined
```

- [JavaScript this]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this}

JavaScript ```this``` is set when a Function is called. When dealing with "Class-like" Object instances the this 
attribute can be confusing. In a variety of places you will notice that a reference to this is captured to ensure that 
the correct context is being referenced.


- [JavaScript Function.bind()]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind}

In some situations we want to explicitly declare what ```this``` will be available within a Function. 
 
From the Mozilla Developer Network documents:

> The bind() method creates a new function that, when called, has its this keyword set to the provided value, with a given sequence of arguments preceding any provided when the new function is called.
    