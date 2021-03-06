master: [![Build Status](https://travis-ci.org/PromenadeSoftware/ParlayUI.svg?branch=master)](https://travis-ci.org/PromenadeSoftware/ParlayUI)
dev: [![Build Status](https://travis-ci.org/PromenadeSoftware/ParlayUI.svg?branch=dev)](https://travis-ci.org/PromenadeSoftware/ParlayUI)

------------
Introduction
------------

ParlayUI is built with JavaScript using the AngularJS and Angular Material frameworks. Both frameworks are supported by Google and have excellent documentation.

[AngularJS](https://angularjs.org/) was chosen for its testability, modularity and the strong community support. 

[Angular Material](https://material.angularjs.org/latest/) provides a set of reusable, well-tested, and accessible UI components based on Material Design.

The ParlayUI interacts with a broker over a WebSocket. The broker handles communication between the ParlayUI and any items using a publish/subscribe system.

A variety of other third party front-end JavaScript libraries are also leveraged. Third party libraries are managed using Bower and can be referenced in the bower.json file located in the ui directory. 
ParlayUI uses the Grunt task-runner to automate tasks during the development and distribution processes. 

-----
Usage
-----

The ParlayUI contains two directories that can serve the UI. The distribution directory, dist, contains a single index.html that has all application JavaScript, CSS and HTML templates concatenated. This makes it easy to include on a variety of platforms as this file can be served by a simple web server. The development directory, dev, contains a copy of the source files needed for the development of the UI. This makes it easy for development as you can inspect the files in an un-minified state.

The ParlayUI is built using the Grunt task runner. Grunt automates several processes that would be tedious if repeatedly done by hand. ParlayUI uses npm for management of build utility packages. Bower is used for management of front-end JavaScript packages. These package managers make it easier to handle the packages that ParlayUI depends on.

Both Grunt and Bower are installed using npm. npm must be installed and configured before either Grunt or Bower can be used.

To build ParlayUI distribution files you must first install npm which is included in the Node.JS package.
[https://docs.npmjs.com/getting-started/installing-node](https://docs.npmjs.com/getting-started/installing-node)

Once npm is installed ParlayUI can be built after cloning the Git repository.

    git clone git@github.com:PromenadeSoftware/ParlayUI.git

After the clone is complete navigate to Parlay/common/parlay/ui.

To retrieve all build time dependencies and front-end dependencies run:

    npm install
    
If the ```grunt-cli``` has not previously been installed on your machine you will also need to run:

    npm install -g grunt-cli

To build the ParlayUI distribution file run:

    grunt build
    
This will retrieve all front-end dependencies, run the unit tests and generate the distribution file (dist/index.html). The distribution file has all JavaScript, CSS and HTML templates inlined. It is the only file needed to be served by the webserver.

To build the ParlayUI development files run:

    grunt develop
    
This will retrieve all front-end dependencies, run the unit tests and launch a webserver that serves the development copy of ParlayUI. For development this is the preferred environment as the source files will be served individually, and in their original unminified state making for easier debugging.

To re-run the unit test suite run:
 
    grunt test
    
To generate unit test coverage data run:
    
    grunt coverage
    
To generate documentation using JSDoc run:
  
    grunt doc
    
To deploy a release run:

    grunt release
    
**This should only be done by ParlayUI maintainers.**

-------------
Documentation
-------------

A reference and tutorials are available at [ParlayUIDocs](https://promenadesoftware.github.io/ParlayUIDocs/).