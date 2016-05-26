The ParlayUI contains two directories that can serve the UI. The distribution directory, dist, contains a single index.html that has all application JavaScript, CSS and HTML templates concatenated. This makes it easy to include on a variety of platforms as this file can be served by a simple web server. The development directory, dev, contains a copy of the source files needed for the development of the UI. This makes it easy for development as you can inspect the files in an un-minified state.

The ParlayUI is built using the Grunt task runner. Grunt automates several processes that would be tedious if repeatedly done by hand. ParlayUI uses npm for management of build utility packages. Bower is used for management of front-end JavaScript packages. These package managers make it easier to handle the packages that ParlayUI depends on.

Both Grunt and Bower are installed using npm. npm must be installed and configured before either Grunt or Bower can be used.

----------
Usage
----------

To build ParlayUI distribution files you must first install npm which is included in the Node.JS package.
[https://docs.npmjs.com/getting-started/installing-node](https://docs.npmjs.com/getting-started/installing-node)

Once npm is installed ParlayUI can be built after cloning the Git repository.

    git clone git@github.com:PromenadeSoftware/Parlay.git

After the clone is complete navigate to Parlay/common/parlay/ui and run:

    npm install

This will retrieve all build time dependencies, front-end dependencies, run the unit tests and generate dist/index.html.

To re-generate dist/index.html run:

    grunt build

To build ParlayUI development files perform the above build process and after the distribution files have been 
built run:

    grunt develop