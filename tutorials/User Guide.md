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