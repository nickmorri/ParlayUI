-----------
Task Runner
-----------

**[Grunt](http://gruntjs.com)**

Grunt is used by ParlayUI to automate some tasks that are frequently repeated during development. All tasks are defined in Gruntfile.js. Grunt will also access additional configuration from vendor_components/**/vendor.js files. Tasks are explained by their comments in the Gruntfile.js. The vendor.js files contain the paths to the vendor defined components. If marked primary then the options object will be used to define the theme of the ParlayUI.

There are two primary tasks that the developer may want to run, develop and build.

    grunt develop

Prepare the source files, ensure all dependencies are available, perform JavaScript and CSS linting, compile all HTML into a JavaScript module, run the unit test suites, launch a http server and watch the source files files for changes. If the source files are changed which the develop task is still running the page will be reloaded in the user’s browser.

    grunt build
    
Prepare the source files, ensure all dependencies are available, perform JavaScript and CSS listing, compile all HTML into a JavaScript module, concatenate and uglify the dependencies and all source files, run the unit test suites, minify the CSS, and inline the uglified JavaScript and minified CSS into the index.html file. The index.html file is all that is required for deployment.

-------------------
Dependency Managers
-------------------

**[npm](https://www.npmjs.com/)**

npm is used by ParlayUI to manage build process dependencies. All dependencies and the required versions are noted in the package.json file. npm will automatically retrieve the full dependency tree for this modules and store them in the node_modules directory.

When installing a new dependency be sure to use the saveDev flag so that the requirement is persistent to the package.json file.

    npm install {package-name} --save-dev


**[Bower](http://bower.io/)**

Bower is used by ParlayUI to manage front-end dependencies. All dependencies and the required versions are noted in the bower.json file. Bower will automatically retrieve the full dependency tree and store the HTML, CSS, JavaScript, fonts or even image files in the bower_components directory.

When installed a new dependency be sure to use the save flag so that the requirement is persisted to the bower.json file.

    bower install {package-name} --save

-----------------
vendor_components
-----------------

The vendor_components directory is intended to contain a directory for each vendor that wishes to extend the functionality of Parlay. A promenade directory is included in the distribution that contains code that may be domain specific to the Promenade software. It is included by default because it contains protocols that allow for interaction with the Promenade broker. If a vendor wants to extend the functionality of Parlay by adding support for custom protocols or implementing custom user interface elements they should include their files in the appropriate sub-directory inside their vendor directory.

The files available in the paths specified within the vendor.json file will be automatically included during the build process. An example directory structure is provided:

- vendor_components
    - vendor
        - css
            - *.css
        - images
            - *.{jpg, png, gif}
        - items
            - directives
                - *.html
            - test
                - *.spec.js
            - *.js
        - widget
            - directives
                - *.html
            - test
                - *.spec.js
            - *.js
        - protocols
            - mocks
                - *.js
            - test
                - *.spec.js
            - *.js
        - vendor.json
        
        
***vendor.json***

There are a number of options available for the vendor.json file.

- name (required) - The vendor’s name. This may be used for customization of ParlayUI.
- primary (required) [default: false] - If marked true by the vendor this indicates that they want their package to customize ParlayUI.
- options (optional) - If the vendor indicates their package as primary then the following attributes will be used to customize the ParlayUI.
    - primaryPalette (required) - This value will be used to provide Angular Material with a primary palette. The available values can be found at https://material.angularjs.org/latest/Theming/01_introduction#palettes.
    - accentPalette (required) - This value will be used to provide Angular Material with a accent palette. The available values can be found at https://material.angularjs.org/latest/Theming/01_introduction#palettes.
    - logo (required) - Defines the logo to be placed in the side navigation. Limited to a maximum height of 50px and a maximum width of 300px.
    - icon (required) - Defines the favicon icon that will be used throughout the browser. Preferred dimensions of 256px by 256px. Should be 1:1 aspect ratio.
- paths (optional) - Defines paths to various component types that the ParlayUI can interface with such as protocols, directives, items, widget, test, mocks, and stylesheets. Grunt globbing patterns can be used.

Example vendor.json file:

```
{
    "name": "vendor",
    "options": {
        "primaryPalette": "blue-grey",
        "accentPalette": "red",
        "logo": "vendor_components/vendor/images/logo.png",
        "icon": "vendor_components/vendor/images/icon.png"
    },
    "paths": {
        "protocols": "vendor_components/vendor/protocols/*.js",
        "directives": "vendor_components/vendor/**/directives/*.html",
        "items": "vendor_components/vendor/items/*.js",
        "test": "vendor_components/vendor/**/test/*.spec.js",
        "mocks": "vendor_components/vendor/**/mocks/*.js",
        "stylesheets": "vendor_components/vendor/css/*.css"
    }
}
```

------------
Contributing
------------

ParlayUI has been architected so that core abstract components belong in parlay_components. Vendor specific items, protocols and interfaces belong in the vendor_components directory. Components should only be added to the parlay_components directory if they are general modules that can be reused by unrelated vendors. Components should be added to the vendor_components directory if they contain vendor or project specific concepts.

-----
Notes
-----

- vendorDefaults.js is modified by the replace Grunt task during develop and build. Options defined in the primary vendor.json are used to replace the placeholders. The task is described in further detail in Gruntfile.js.
- index.html is modified by the following Grunt tasks:
    - During develop wiredep will replace the following HTML comment tags:
        - ```<!-- bower:css --><!-- endbower -->``` with the CSS files belonging to the Bower dependencies.
        - ```<!-- bower:js --><!-- endbower -->``` with the JavaScript files belonging to the Bower dependencies.
    - During develop and build processhtml will replace the follwing the HTML comment tags:
        - ```<!-- build:css:dist inline tmp/lib.min.css --><!-- /build -->``` with tmp/lib.min.css
        - ```<!-- build:css:dist inline tmp/parlayui.min.css --><!-- /build -->``` with tmp/parlayui.min.css
        - ```<!-- build:js:dist inline tmp/lib.min.js --><!-- /build -->``` with tmp/lib.min.js
        - ```<!-- build:js:dist inline tmp/parlayui.min.js --><!-- /build —>``` with tmp/parlayui.min.js
- Grunt’s design makes the creation of temporary files necessary. These files are stored in the tmp directory. Several tasks will create files that stored here temporarily only to be used by other tasks as a intermediary representation. A competing task runner Gulp uses pipes between different tasks which eliminates the need for temporary files, it may be worth transitioning to Gulp at some point.