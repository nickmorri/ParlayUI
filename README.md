------------
Introduction
------------

ParlayUI is built with JavaScript using the AngularJS and Angular Material frameworks. Both frameworks are supported by Google and have excellent documentation.

[AngularJS](https://angularjs.org/) was chosen for its testability, modularity and the strong community support. 

[Angular Material](https://material.angularjs.org/latest/) provides a set of reusable, well-tested, and accessible UI components based on Material Design.

The ParlayUI interacts with a broker over a WebSocket. The broker handles communication between the ParlayUI and any items using a publish/subscribe system.

A variety of other third party front-end JavaScript libraries are also leveraged. Third party libraries are managed using Bower and can be referenced in the bower.json file located in the ui directory. 
ParlayUI uses the Grunt task-runner to automate tasks during the development and distribution processes. 

_Further documentation of these processes is available in the [Development tutorial]{@tutorial Development}._

-----
Usage
-----

When ParlayUI first loads it will request from the Broker all available and currently connected protocol connections. It will then perform an automatic discovery.

Navigation between different components of the ParlayUI may be done by clicking the navigation menu, the first item beneath the Parlay logo.
This will list all available components. By default ParlayUI will load the ```Items``` component.

#### Protocols

###### Protocol List Dialog

Protocol connections can be viewed by selecting the ```Protocols``` navigation item. This will launch a dialog with a list of all currently connected and saved protocol connections.
From here you can manage open and saved protocol connections as well as open new connections to available protocols. 
A open protocol is a protocol connection that is actively connected to the broker, this protocols items are available for communication.
A saved protocol is a protocol connection that has been connected previously to the broker and is available for connection but is not currently connected. 
New connections to available protocols can be opened by selecting the ```open protocol``` button at the bottom of the dialog.

###### Protocol Configuration Dialog

A new protocol connection can be made to an available protocol by completing the form for protocol configuration.
 
_Further documentation on how to use Protocols is available in the [Protocols Use tutorial.]{@tutorial Protocols}_
_Further documentation on how to develop Protocols is available in the Protocols Development tutorial._

#### Items

An item can be added to a workspace by searching for the name of the item in the search bar provided in the navigation menu.

###### Item Cards

Once added to the workspace it can be removed, copied or rearranged with any other items active in the workspace.
An item card represents one ParlayItem. An item card by default has a command, property, graph and log tab that allow the user to
interact with and view data from a ParlayItem.

_Further documentation on how to use Items and Items cards is available in the [Items Use tutorial]{@tutorial Items Use}._
_Further documentation on how to develop Items and Items card is available in the [Items Development tutorial]{@tutorial Items Development}._

#### Workspaces

Workspace management is done by selecting the ```Workspaces``` navigation item. This will launch a dialog with a list of all saved workspace configurations.
A workspace is a collection of items. Workspaces can be saved, loaded, and deleted from this dialog. Workspaces can also be exported and imported from a browser.
If items are active in the current workspace and the user leaves the browser window a autosaved workspace will automatically be created to prevent loss of work.

#### Notifications

Notifications may be view by selecting the ```Notifications``` navigation item.
This will launch the notifications side navigation panel. All notifications displayed in the ParlayUI are recorded here for reference.
Some actions associated with previously displayed notifications can be performed from here if notification was dismissed before the user had a chance to commit the action.  

#### Settings

Settings management is done by selecting the ```Settings``` navigation item.
Different components of the ParlayUI use user configurable settings to control their behavior.

----------
Developing
----------

The ParlayUI contains two directories that can serve the UI. The distribution directory, dist, contains a single index.html that has all application JavaScript, CSS and HTML templates concatenated. This makes it easy to include on a variety of platforms as this file can be served by a simple web server. The development directory, dev, contains a copy of the source files needed for the development of the UI. This makes it easy for development as you can inspect the files in an un-minified state.

The ParlayUI is built using the Grunt task runner. Grunt automates several processes that would be tedious if repeatedly done by hand. ParlayUI uses npm for management of build utility packages. Bower is used for management of front-end JavaScript packages. These package managers make it easier to handle the packages that ParlayUI depends on.

Both Grunt and Bower are installed using npm. npm must be installed and configured before either Grunt or Bower can be used.

To build ParlayUI distribution files you must first install npm which is included in the Node.JS package.
[https://docs.npmjs.com/getting-started/installing-node](https://docs.npmjs.com/getting-started/installing-node)

Once npm is installed ParlayUI can be built after cloning the Git repository.

    git clone git@github.com:PromenadeSoftware/Parlay.git

After the clone is complete navigate to Parlay/common/parlay/ui and run:

    npm install

This will retrieve all build time dependencies, front-end dependencies, run the unit tests and generate dist/index.html. dist/index.html has all JavaScript, CSS and HTML templates inlined. It is the only file needed to be served by the webserver.

To re-generate dist/index.html run:

    grunt build

To build ParlayUI development files perform the above build process and run:

    grunt develop
    
This will retrieve all front-end dependencies, run the unit tests and launch a webserver that serves the development copy of ParlayUI. For development this is the preferred environment as the source files will be served individually, and in their original unminified state making for easier debugging.
    
_Further documentation of these processes is available in the [Development tutorial]{@tutorial Development}._