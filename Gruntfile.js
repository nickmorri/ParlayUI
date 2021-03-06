module.exports = function (grunt) {
    "use strict";

    // Base paths to parlay_components and vendor_components directories.
    var parlay_components_base_path = "parlay_components/";
    var vendor_components_base_path = "vendor_components/";
    var parlay_script_modules_base_path = "parlay_script_modules/";

	/**
	 * Loads each vendor configuration file available in vendor_components
	 * @returns {Array} - Array of vendor configuration Objects.
	 */
	function getVendors () {
        return grunt.file.expand('vendor_components/**/vendor.json').map(function (vendor) {
            return grunt.file.readJSON(vendor);
        });
	}

    /**
     * Returns vendor that has the primary flag set, defaults to "promenade" vendor if no other primary is found.
     * @param {Array} vendors - Array of vendor configuration Objects.
     * @returns {Object} - Primary vendor configuration Object.
     */
    function getPrimaryVendor (vendors) {

        // Select all vendors that have the primary flag set.
        var primary = vendors.filter(function (vendor) {
            return vendor.primary;
        });

        // Select the "promenade" vendor.
		var promenade = vendors.find(function (vendor) {
			return vendor.name == "promenade";
		});

        if (primary.length === 1) {
            // Only one vendor has primary flag set, select that vendor.
            return primary[0];
        }
        else if (primary.length === 0 && !!promenade) {
            // No vendor has primary flag set, select "promenade" as primary vendor by default.
            return promenade;
        }
		else if (primary.length === 0 && !promenade) {
			// No vendor has primary flag set and "promenade" vendor is not available to set by default.
			throw new Error("Either one vendor must be primary or promenade vendor files must be included.");
		}
        else {
            // More than one vendor has primary flag set.
            throw new Error("Only one vendor can be primary. Multiple vendor.json configurations have the primary flag set.");
        }
    }

    /**
     * Returns the paths properties of all the given vendors.
     * @param {Array} vendors - Array of vendor configuration Objects.
     * @returns {Object} - Object of key (vendor name) -> value (vendor paths property).
     */
    function getVendorPaths (vendors) {
        var base = vendor_components_base_path;
        return vendors.reduce(function (accumulator, vendor) {
            accumulator[vendor.name] = Object.keys(vendor.paths).reduce(function (accumulator, key) {
                accumulator[key] = base + vendor.name + "/" + vendor.paths[key];
                return accumulator;
            }, {});
            return accumulator;
        }, {});
    }

    function getImagePaths (vendor) {
        var base = vendor_components_base_path;

        return {
            icon: base + vendor.name + "/" + vendor.options.icon,
            logo: base + vendor.name + "/" + vendor.options.logo
        };
    }

    /**
     * Takes a filepath and returns a Base64 String encoding of the file at the given filepath.
     * @param {String} filepath - file system path to a file.
     * @returns {String} - Base64 encoded String of the file at the given filepath.
     */
    function getBase64 (filepath) {
        var split_path = filepath.split(".");
        var extension = split_path[split_path.length - 1];
        var file = grunt.file.read(filepath, {encoding: null});
        var headers = "data:image/" + extension + ";base64,";
        var base64_file = file.toString("base64");
        return headers + base64_file;
    }

	/**
	 * Process vendor items and return an Array of Strings that Grunt can use.
     * @param {Array} vendors - Array of vendor configuration Objects.
	 * @param {Array} target_component - Component items we are searching for.
	 * @param {Array} initial_paths - Any component we want to include explicitly.
	 * @returns {Array} - Array of all components we extracted from the vendor Object and explicitly included components.
	 */
	function getVendorPathGlobs (vendors, target_component, initial_paths) {

        // Object { vendor name -> Object { component name -> component path } }
        var vendors_paths = getVendorPaths(vendors);

        // Array [ vendor name ]
		var vendor_names = Object.keys(vendors_paths);

        // Array [ all vendor components in Grunt file path glob pattern ]
		return (initial_paths || []).concat(vendor_names.reduce(function (accumulator, vendor_name)  {
            // Don't attempt to process a vendors component paths if they don't define any.
			if (vendors_paths[vendor_name] === undefined) {
				return accumulator;
			}
			else {
                // Array [ all of a vendor's component paths ]
				var potential_paths = Object.keys(vendors_paths[vendor_name]);

                // Array [ vendor's component paths that match the target component ]
				var matched_paths = potential_paths.filter(function (path) {
                    // Boolean ( True if a match is found, False otherwise )
					return target_component.some(function (item) {
                        // Boolean ( True if path contains a target component, False otherwise )
						return path.indexOf(item) > -1;
					});
				});

                // Array [  ]
				return accumulator.concat(matched_paths.map(function (key) {
					return '<%= meta.vendor_paths.' + vendor_name + '.' + key + ' %>';
				}));
			}
	    }, []));
	}

    // Note: this function relies on the implementation of registerModule in workerImports.js
    // retrieves all module files and concatenates them for inclusion in the worker script
    function concatParlayNativeModules() {
        // retrieve all JS module files
        return grunt.file.expand(parlay_script_modules_base_path + "**/*.{js,py}")
            .reduce(function(rest, filepath){

                var ext = filepath.slice(-2);
                // get the filepath relative to parlay_script_modules as an array and with the file extension removed
                var moduleTree = filepath.slice(0, -3).split("/").slice(1);

                // if this is an init file, generate the registration for the filepath to its parent directory
                if (moduleTree[moduleTree.length - 1] === "__init__") {
                    moduleTree.pop();
                }

                var modPath = filepath.slice(filepath.indexOf("/") + 1);
                var modName = moduleTree.join(".");
                var modVar = moduleTree.join("_");

                var registration = '\nregisterModule("'+ modPath +'","'+ modName +'", '+ modVar +', "'+ ext +'");\n';

                var body;

                if (ext === "js") {
                    body = grunt.file.read(filepath);
                } else {
                    // assign the Python code to modVar as a string
                    body = 'var ' + modVar + '="' + grunt.file.read(filepath)
                                    .replace(/\"/g, "\\\"")
                                    //escape any newlines (and remove possible carriage returns)
                                    .replace(/\r?\n/g, "\\n") + '";';
                }

                return rest + body + registration;
            }, "");
    }

    function loadSkulpt(buildType) {

        var fileData = grunt.file.read("bower_components/skulpt/skulpt.min.js")
            // since this file gets inlined, we need to remove the script tags from the quotes
                            .replace(/<script.{0,40}\/script>/g, "<div>sanitized for compilation</div>") + ";\n" +
                        grunt.file.read("bower_components/skulpt/skulpt-stdlib.js");

        // at some point we may want to use the non-minified script for dev
        if(buildType === 'dev') {
            //TODO: debug use of skulpt (vs skulpt.min) for easier debugging
            return fileData;
        } else {
            return fileData;
        }
    }

	// Read the dependencies in package.json and load Grunt tasks that match "grunt-*".
	require('load-grunt-tasks')(grunt);

	// Load this Grunt task individually since it doesn't match the "grunt-*" pattern.
    grunt.loadNpmTasks('main-bower-files');
	grunt.loadNpmTasks('grunt-license-bower');

	grunt.initConfig({

        'pkg': grunt.file.readJSON('package.json'),

		'meta': {
            'parlay_component_base_path': parlay_components_base_path,
            'vendor_component_base_path': vendor_components_base_path,
            'parlay_script_modules_base_path': parlay_script_modules_base_path,
			'source': getVendorPathGlobs(getVendors(), ['source'], ['app.js',  '<%= meta.parlay_component_base_path %>/*/*.js']),
            'vendor_paths': getVendorPaths(getVendors()),
            'bower_files': require('main-bower-files')(),
			'dist_destination': 'dist',
			'dev_destination': 'dev',
			'tmp_destination': 'tmp',
			'coverage_destination': 'coverage',
			'mocks': getVendorPathGlobs(getVendors(), ['mocks'], ['<%= meta.parlay_component_base_path %>/*/mocks/*.js']),
			'tests': getVendorPathGlobs(getVendors(), ['test'], ['<%= meta.parlay_component_base_path %>/*/test/*.spec.js']),
			'compiled_html': '<%= meta.tmp_destination %>/templates.js',
			'html_directives': getVendorPathGlobs(getVendors(), ['directives'], ['<%= meta.parlay_component_base_path %>/**/directives/*.html']),
			'html_views': '<%= meta.parlay_component_base_path %>/**/views/*.html',
			'stylesheets': getVendorPathGlobs(getVendors(), ['stylesheets'], ['css/*.css']),
            'tutorials': getVendorPathGlobs(getVendors(), ['tutorials'], ['tutorials/*.md', '<%= meta.parlay_component_base_path %>/**/tutorials/*.md'])
		},

        // Minimal web server. Used for development.
        // https://github.com/blai/grunt-express
		'express': {
			'options': {
				'port': 9000,
				'hostname': '0.0.0.0'
			},
			'dev': {
				'options': {
					'bases': ['<%= meta.dev_destination %>'],
					'livereload': true
				}
			},
            'dist': {
                'options' : {
                    'bases': ['<%= meta.dist_destination %>']
                }
            }
		},

        // Run tasks whenever the watched files change. Used for development.
        // https://github.com/gruntjs/grunt-contrib-watch
        'watch': {
            'scripts': {
                'options': {
                    'livereload': true,
                    'interrupt': true
                },
                'files': ['vendorDefaults.js', 'workerImports.js', '<%= meta.source %>',
                            "<%= meta.parlay_script_modules_base_path %>/**/*.{js,py}"],
                'tasks': ['replace:dev', 'newer:jshint:dev', 'karma:dev', 'newer:copy:dev', 'includeSource:dev', 'wiredep:dev']
            },
            'stylesheets': {
                'options': {
                    'debounceDelay': 0,
                    'livereload': true,
                    'spawn': false
                },
                'files': '<%= meta.stylesheets %>',
                'tasks': ['newer:csslint:dev', 'newer:copy:dev', 'includeSource:dev', 'wiredep:dev']
            },
            'html': {
                'options': {
                    'debounceDelay': 0,
                    'livereload': true,
                    'spawn': false
                },
                'files': ['<%= meta.html_directives %>', '<%= meta.html_views %>'],
                'tasks': ['newer:html2js', 'newer:copy', 'includeSource:dev', 'wiredep:dev']
            },
            'index': {
                'options': {
                    'debounceDelay': 0,
                    'livereload': true,
                    'spawn': false
                },
                'files': ['index.html'],
                'tasks': ['includeSource:dev', 'wiredep:dev']
            },
            'tests': {
                'options': {
                    'interrupt': true
                },
                'files': '<%= meta.tests %>',
                'tasks': 'karma:dev'
            },
            'mocks': {
                'files': '<%= meta.mocks %>',
                'tasks': 'karma:dev'
            },
            'vendor_config': {
                'files': '<%= meta.vendor_component_base_path %>/**/vendor.json',
                'options': {
                    'reload': true
                },
                'tasks': ['replace:dev']
            }
        },

        // Installs Bower components listed in bower.json.
        // https://github.com/rse/grunt-bower-install-simple
		'bower-install-simple': {
			'options': {
				'directory': 'bower_components'
			},
			'dist': {
				'options': {
					'production': true
				}
			},
			'dev': {
				'options': {
					'production': false
				}
			}
		},

        // Copies packages from bower_components. Used for development.
        // https://github.com/curist/grunt-bower
		'bower': {
			'dev': {
				'base': 'bower_components',
				'dest': '<%= meta.dev_destination %>/bower_components',
				'options': {
					'checkExistence': true,
					'debugging': true,
					'paths': {
						'bowerDirectory': 'bower_components',
						'bowerrc': '.bowerrc',
						'bowerJson': 'bower.json'
					}
				}
			}
		},

        // Concatenates Bower components in the correct order based on dependencies. Used for distribution.
        // See bower + wiredep tasks as functional equivalent for development.
        // https://github.com/sapegin/grunt-bower-concat
		'bower_concat': {
			'dist': {
				'dest': {
					'js': '<%= meta.tmp_destination %>/lib.js',
                    'css': '<%= meta.tmp_destination %>/lib.css'
				},
                'mainFiles': {
                    'ace-builds': [
                        "src-noconflict/ace.js",
                        "src-noconflict/mode-javascript.js",
						"src-noconflict/mode-python.js",
                        "src-noconflict/ext-language_tools.js",
                        "src-noconflict/worker-javascript.js"
                    ],
                    //'jsinterpreter': 'acorn_interpreter.js' //,
                    "chart.js": "dist/Chart.bundle.min.js"
                },
                'exclude': ["skulpt"]
			}
		},

        // Wires Bower dependencies into index.html. Depends on bower task. Used for development.
        // See bower_concat task as functional equivalent for distribution.
        // https://github.com/taptapship/wiredep
		'wiredep': {
			'dev': {
				'src': '<%= meta.dev_destination %>/index.html',
                'exclude': 'bower_components/skulpt/*',
			}
		},

        // Automatically opens the default web browser pointed at the express web server.
        // https://github.com/jsoverson/grunt-open
		'open': {
			'server': {
				'path': 'http://localhost:<%= express.options.port %>'
			},
			'coverage': {
				'path': function () {
					var reports = grunt.file.expand('coverage/PhantomJS*/index.html');
                    return reports[reports.length - 1].toString();
				}
			}
		},

        // Interfaces with Karma to run unit tests.
        // https://github.com/karma-runner/grunt-karma
		'karma': {
			'options': {
				'configFile': 'karma.conf.js'
			},
			'dev': {
				'options': {
					'reporters': ['progress'],
					'files': [
                        '<%= meta.bower_files %>',
			            '<%= meta.compiled_html %>',
			            '<%= meta.source %>',
			            '<%= meta.mocks %>',
			            '<%= meta.tests %>'
					]
				}
			},
			'dist': {
				'options': {
					'reporters': ['progress'],					
					'files': [
                        '<%= meta.bower_files %>',
			            '<%= meta.tmp_destination %>/<%= pkg.namelower %>.min.js',
			            '<%= meta.mocks %>',
			            '<%= meta.tests %>'
					]
				}
			},
			'coverage': {
				'options': {
					'reporters': ['progress', 'coverage'],
					'preprocessors': {
						'<%= meta.parlay_component_base_path %>/*.js': ['coverage'],
			            '<%= meta.parlay_component_base_path %>/**/*.js': ['coverage'],
			            '<%= meta.vendor_component_base_path %>/**/*.js': ['coverage']
					},
					'coverageReporter': {
			            'type': 'html',
			            'dir': '<%= meta.coverage_destination %>'
					},
					'files': [
                        '<%= meta.bower_files %>',
			            '<%= meta.compiled_html %>',
			            '<%= meta.source %>',
			            '<%= meta.mocks %>',
			            '<%= meta.tests %>'
					]
				}
			}
		},

        // Validates JavaScript files.
        // https://github.com/gruntjs/grunt-contrib-jshint
		'jshint': {
			'dev': {
				'options': {
					'esnext': true,
					'debug': true
				},
				'src': ['<%= meta.source %>', '<%= meta.tests %>'],
				'gruntfile': 'Gruntfile.js'
			},
			'dist': {
				'options': {
					'esnext': true
				},
				'src': ['<%= meta.source %>']
			}
		},

        // Validates CSS files.
        // https://github.com/gruntjs/grunt-contrib-csslint
		'csslint': {
			'dist': {
				'src': '<%= meta.stylesheets %>'
			},
			'dev': {
				'src': '<%= meta.stylesheets %>',
				'options': {
					'important': false
				}
			},
			'options': {
				'adjoining-classes': false,
				'outline-none': false,
                'known-properties': false
			}
		},

        // Clears files and folders.
        // https://github.com/gruntjs/grunt-contrib-clean
		'clean': {
			'dist': ['<%= meta.dist_destination %>', '**/*/*.autogen.js'],
            'post_dist': ['<%= meta.dist_destination %>/*.css', '<%= meta.dist_destination %>/*.js'],
			// clean anything thats auto generated and the dev dest
			'dev': ['<%= meta.dev_destination %>', '**/*/*.autogen.js'],
			'tmp': '<%= meta.tmp_destination %>',
			'coverage': '<%= meta.coverage_destination %>',
			'doc': ['doc', '<%= meta.tmp_destination %>/tutorials']
		},

        // Copies files and folders.
        // https://github.com/gruntjs/grunt-contrib-copy
		'copy': {
			'dev': {
		        'files': [
					{
                        'expand': true,
                        'src': [
                            '<%= meta.source %>',
                            '<%= meta.compiled_html %>',
                            '<%= meta.stylesheets %>',
							'*.autogen.js'
                        ],
                        'dest': '<%= meta.dev_destination %>'
                    }
				]
			},
            'doc': {
                'files': [
                    {
                        'expand': true,
                        'flatten': true,
                        'src': [
                            '<%= meta.tutorials %>'
                        ],
                        'dest': '<%= meta.tmp_destination %>/tutorials'
                    }
                ]
            }
		},

        // Processes and modify index.html based on the environment to replace text.
        // https://github.com/dciccale/grunt-processhtml
		'processhtml': {
			'dist': {'files': {'<%= meta.dist_destination %>/index.html': ['index.html']}},
			'dev': {'files': {'<%= meta.dev_destination %>/index.html': ['index.html']}}
		},

        // Minify JavaScript files during distribution.
        // https://github.com/gruntjs/grunt-contrib-uglify
		'uglify': {
			'options': {
				'mangle': true,
				'compress': true,
				'sourceMap': false,
				'preserveComments': false,
                'ASCIIOnly': true
			},
			'dist': {
				'files': {
					'<%= meta.tmp_destination %>/<%= pkg.namelower %>.min.js':
                        ['<%= meta.tmp_destination %>/vendorDefaults.js',
                            '<%= meta.tmp_destination %>/workerImports.js',
                            '<%= meta.source %>', '<%= meta.compiled_html %>'],
                    '<%= meta.tmp_destination %>/lib.min.js': '<%= meta.tmp_destination %>/lib.js'
				}
			}
		},

        // Minify CSS files during distribution.
        // https://github.com/gruntjs/grunt-contrib-cssmin
		'cssmin': {
			'options': {
	        	'shorthandCompacting': false,
				'roundingPrecision': -1
			},
			'dist': {
				'files': {
                    '<%= meta.tmp_destination %>/<%= pkg.namelower %>.min.css': '<%= meta.stylesheets %>',
                    '<%= meta.tmp_destination %>/lib.min.css': '<%= meta.tmp_destination %>/lib.css'
                }
			},
			'dev': {
				'files': {'<%= meta.tmp_destination %>/<%= pkg.namelower %>.min.css': '<%= meta.stylesheets %>'}
			}
		},

        // Converts AngularJS templates to JavaScript.
        // https://github.com/karlgoldstein/grunt-html2js
		'html2js': {
			'main': {
				'src': ['<%= meta.html_views %>', '<%= meta.html_directives %>'],
				'dest': '<%= meta.compiled_html %>'
			}
		},

        // Replace the matching patterns in the given files with the specified replacement.
        // https://github.com/outaTiME/grunt-replace
        'replace': {
            'dev': {
                'options': {
                    'patterns': [
                        {'match': 'vendorName', 'replacement': getPrimaryVendor(getVendors()).name},
                        {'match': 'vendorLogo', 'replacement': getBase64(getImagePaths(getPrimaryVendor(getVendors())).logo)},
                        {'match': 'vendorIcon', 'replacement': getBase64(getImagePaths(getPrimaryVendor(getVendors())).icon)},
                        {'match': 'primaryPalette', 'replacement': getPrimaryVendor(getVendors()).options.primaryPalette},
                        {'match': 'accentPalette', 'replacement': getPrimaryVendor(getVendors()).options.accentPalette},
                        {'match': 'debugEnabled', 'replacement': true},
                        {'match': 'importSkulpt', 'replacement': loadSkulpt('dev')},
                        {'match': 'importParlay', 'replacement': concatParlayNativeModules()}
                    ]
                },
                'files': [
                    {'expand': true, 'flatten': true, 'src': 'vendorDefaults.js', 'dest': '<%= meta.dev_destination %>'},
                    {'expand': true, 'flatten': true, 'src': 'workerImports.js', 'dest': '<%= meta.dev_destination %>'}
                ]
            },
            'dist': {
                'options': {
                    'patterns': [
                        {'match': 'vendorName', 'replacement': getPrimaryVendor(getVendors()).name},
                        {'match': 'vendorLogo', 'replacement': getBase64(getImagePaths(getPrimaryVendor(getVendors())).logo)},
                        {'match': 'vendorIcon', 'replacement': getBase64(getImagePaths(getPrimaryVendor(getVendors())).icon)},
                        {'match': 'primaryPalette', 'replacement': getPrimaryVendor(getVendors()).options.primaryPalette},
                        {'match': 'accentPalette', 'replacement': getPrimaryVendor(getVendors()).options.accentPalette},
                        {'match': 'debugEnabled', 'replacement': false},
                        {'match': 'importSkulpt', 'replacement': loadSkulpt('dist')},
                        {'match': 'importParlay', 'replacement': concatParlayNativeModules()}
                    ]
                },
                'files': [
                    {'expand': true, 'flatten': true, 'src': 'vendorDefaults.js', 'dest': '<%= meta.tmp_destination %>'},
                    {'expand': true, 'flatten': true, 'src': 'workerImports.js', 'dest': '<%= meta.tmp_destination %>'}
                ]
            }
        },

        // Automatically include JavaScript and CSS references in index.html during development.
        // https://github.com/jwvdiermen/grunt-include-source
        'includeSource': {
			'options': {
				'baseUrl': ""
			},
            'dev': {
                'files': {
                    'dev/index.html': 'index.html'
                }
            }
		},
		
		'jsdoc': {
			'doc': {
				'src': ['<%= meta.source %>']
			},
            'options': {
                'private': true,
                'readme': 'README.md',
				'tutorials': '<%= meta.tmp_destination %>/tutorials'
            }
		},

		'release': {
			'options': {
				'npm': false,
				'additionalFiles': ['package.json', 'bower.json']
			}
		},

		'gh-pages': {
			'options': {
				'repo': 'git@github.com:PromenadeSoftware/ParlayUIDocs.git',
				'base': 'doc'
			},
			'src': ['**']
		},

		'license': {
			'dist': {
				// Target-specific file lists and/or options go here.
				options: {
					// Target-specific options go here.
					directory: 'bower_components',
					output: 'LICENSES'
				},
			},
		},
		'modernizr': {
			dev: {
				"parseFiles": true,
				"customTests": [],
				//"devFile": "/PATH/TO/modernizr-dev.js",
				"dest": "modernizr.autogen.js",
				"tests": [
					// Tests
				],
				"options": [
					"setClasses"
				],
				"uglify": false
			},
			dist: {
				"parseFiles": true,
				"customTests": [],
				//"devFile": "/PATH/TO/modernizr-dev.js",
				"dest": "modernizr.autogen.js",
				"tests": [
					// Tests
				],
				"options": [
					"setClasses"
				],
				"uglify": true
			}
		}

	});
	
	grunt.registerTask('default', [
        'develop'
    ]);

    // Generates dev directory containing files needed for development. Launches an express HTTP server and a watch
    // task that monitors the source files for changes.
	grunt.registerTask
	('develop', 'Lints and tests JavaScript files, processes HTML and finally starts HTTP server which autoreloads on file changes.', [
		'clean:dev',
        'clean:dist',
        'clean:tmp',
		'jshint:dev',
	    'csslint:dev',
		'modernizr:dev',
	    'bower-install-simple:dev',
        'replace:dev',
	    'bower:dev',
	    'html2js',
	    'copy:dev',
	    'karma:dev',
        'includeSource:dev',
        'wiredep:dev',
	    'express:dev',
	    'open:server',
	    'watch'
	]);

    // Generates dist/index.html with all Parlay, vendor and library source inlined.
	grunt.registerTask('dist', 'Generates tested and linted minified JavaScript and CSS files with HTML templates included in JavaScript.', [
        'clean:dev',
	    'clean:dist',
        'clean:tmp',
		'jshint:dist',
	    'csslint:dist',
		'modernizr:dist',
	    'bower-install-simple:dist',
        'replace:dist',
        'bower_concat:dist',
	    'html2js',
	    'uglify:dist',
	    'cssmin:dist',
        'processhtml:dist',
        'clean:post_dist'
	]);

	grunt.registerTask('travis_doc_deploy', 'Task for Travis document deployment', [
		'doc',
		'gh-pages'
	]);

	grunt.registerTask('build', [
        'dist'
    ]);

	grunt.registerTask('server', 'Launches HTTP server with distribution files as source.', [
	    'express:dist',
	    'open:server',
	    'express-keepalive'
	]);

    grunt.registerTask('test', 'Lints and tests JavaScript files.', [
		'bower:dev',
        'jshint:dev',
        'csslint:dev',
        'html2js',
        'karma:dev'
    ]);

    grunt.registerTask('coverage', 'Generates and opens test coverage.', [
        'karma:coverage',
        'open:coverage'
    ]);

	grunt.registerTask('doc', 'Generates documentation.', [
		'clean:doc',
        'copy:doc',
		'jsdoc:doc'
	]);



};
