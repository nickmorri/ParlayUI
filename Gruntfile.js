module.exports = function (grunt) {
    "use strict";
	
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

        var primary = vendors.filter(function (vendor) {
            return vendor.primary;
        });

        if (primary.length === 1) {
            // Only one vendor has primary flag set, select that vendor.
            return primary[0];
        }
        else if (primary.length === 0) {
            // No vendor has primary flag set, select "promenade" as primary vendor by default.
            return vendors.find(function (vendor) {
                return vendor.name == "promenade";
            });
        }
        else {
            // More than one vendor has primary flag set.
            throw new Error("Only one vendor can be primary. Multiple vendor.json configurations have the primary flag set.");
        }
    }

    /**
     * Returns the options properties of all the given vendors.
     * @param {Array} vendors - Array of vendor configuration Objects.
     * @returns {Object} - Object of key (vendor name) -> value (vendor options property).
     */
    function getVendorOptions (vendors) {
        return vendors.reduce(function (accumulator, vendor) {
            accumulator[vendor.name] = vendor.options;
            return accumulator;
        }, {});
    }

    /**
     * Returns the paths properties of all the given vendors.
     * @param {Array} vendors - Array of vendor configuration Objects.
     * @returns {Object} - Object of key (vendor name) -> value (vendor paths property).
     */
    function getVendorPaths (vendors) {
        return vendors.reduce(function (accumulator, vendor) {
            accumulator[vendor.name] = vendor.paths;
            return accumulator;
        }, {});
    }

    /**
     * Takes a filepath and returns a Base64 String encoding of the file at the given filepath.
     * @param {String} filepath - file system path to a file.
     * @returns {String} - Base64 encoded String of the file at the given filepath.
     */
    function getBase64 (filepath) {
        var split_path = filepath.split(".");
        var extension = split_path[split_path.length - 1];
        return "data:image/" + extension + ";base64," + grunt.file.read(filepath, {encoding: null}).toString("base64");
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
					return '<%= vendor_paths.' + vendor_name + '.' + key + ' %>';
				}));
			}
	    }, []));
	}

	// Read the dependencies in package.json and load Grunt tasks that match the "grunt-*".
	require('load-grunt-tasks')(grunt);

	// Load this Grunt task individually since it doesn't match the "grunt-*" pattern.
    grunt.loadNpmTasks('main-bower-files');

	// Array of bower main JS files.
	var mainBowerFiles = require('main-bower-files');

	grunt.initConfig({

        'pkg': grunt.file.readJSON('package.json'),

		'vendor_paths': getVendorPaths(getVendors()),

        'vendor_options': getVendorOptions(getVendors()),

		'meta': {
			'source': ['app.js', 'parlay_components/*/*.js'],
			'vendorComponents': getVendorPathGlobs(getVendors(), ['protocols', 'items'], []),
            'vendorOptions': getVendorOptions(getVendors()),
			'dist_destination': 'dist',
			'dev_destination': 'dev',
			'tmp_destination': 'tmp',
			'coverage_destination': 'coverage',
			'mocks': getVendorPathGlobs(getVendors(), ['mocks'], ['parlay_components/*/mocks/*.js']),
			'tests': getVendorPathGlobs(getVendors(), ['test'], ['parlay_components/*/test/*.spec.js']),
			'compiledHtml': '<%= meta.tmp_destination %>/templates.js',
			'htmlDirectives': getVendorPathGlobs(getVendors(), ['directives'], ['parlay_components/**/directives/*.html']),
			'htmlViews': 'parlay_components/**/views/*.html',
			'stylesheets': getVendorPathGlobs(getVendors(), ['stylesheets'], ['css/*.css'])
		},

        // Minimal web server used for development.
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

        // Run tasks whenever the watched files change.
        // https://github.com/gruntjs/grunt-contrib-watch
        'watch': {
            'scripts': {
                'options': {
                    'livereload': true,
                    'interrupt': true
                },
                'files': ['vendorDefaults.js', '<%= meta.source %>', '<%= meta.vendorComponents %>'],
                'tasks': ['newer:replace:dev', 'newer:jshint:dev', 'karma:dev', 'newer:copy:dev']
            },
            'stylesheets': {
                'options': {
                    'debounceDelay': 0,
                    'livereload': true,
                    'spawn': false
                },
                'files': '<%= meta.stylesheets %>',
                'tasks': ['newer:csslint:dev', 'newer:copy:dev']
            },
            'html': {
                'options': {
                    'debounceDelay': 0,
                    'livereload': true,
                    'spawn': false
                },
                'files': ['<%= meta.htmlDirectives %>', '<%= meta.htmlViews %>'],
                'tasks': ['newer:html2js', 'newer:copy']
            },
            'index': {
                'options': {
                    'debounceDelay': 0,
                    'livereload': true,
                    'spawn': false
                },
                'files': ['index.html'],
                'tasks': ['processhtml:dev', 'wiredep:dev']
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
            'Gruntfile': {
                'files': 'Gruntfile.js',
                'options': {
                    'reload': true
                }
            },
            'vendor_config': {
                'files': 'vendor_components/**/vendor.json',
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

        // Copies packages from bower_components during development.
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

        // Concatenates Bower components in the correct order based on dependencies.
        // https://github.com/sapegin/grunt-bower-concat
		'bower_concat': {
			'dist': {
				'dest': {
					'js': '<%= meta.tmp_destination %>/lib.js',
                    'css': '<%= meta.tmp_destination %>/lib.css'
				}
			}
		},

        // Wires Bower dependencies into index.html during development.
        // https://github.com/taptapship/wiredep
		'wiredep': {
			'dev': {
				'src': '<%= meta.dev_destination %>/index.html'
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
                        mainBowerFiles(),
			            '<%= meta.compiledHtml %>',
			            '<%= meta.source %>',
			            '<%= meta.mocks %>',
			            '<%= meta.vendorComponents %>',
			            '<%= meta.tests %>'
					]
				}
			},
			'dist': {
				'options': {
					'reporters': ['progress'],					
					'files': [
                        mainBowerFiles(),
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
						'parlay_components/*.js': ['coverage'],
			            'parlay_components/**/*.js': ['coverage'],
			            'vendor_components/**/*.js': ['coverage']
					},
					'coverageReporter': {
			            'type': 'html',
			            'dir': '<%= meta.coverage_destination %>'
					},
					'files': [
                        mainBowerFiles(),
			            '<%= meta.compiledHtml %>',
			            '<%= meta.source %>',
			            '<%= meta.mocks %>',
			            '<%= meta.vendorComponents %>',
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
				'src': ['<%= meta.source %>', '<%= meta.vendorComponents %>', '<%= meta.tests %>'],
				'gruntfile': 'Gruntfile.js'
			},
			'dist': {
				'options': {
					'esnext': true
				},
				'src': ['<%= meta.source %>', '<%= meta.vendorComponents %>']
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
					'important': false,
					'known-properties': false
				}
			},
			'options': {
				'adjoining-classes': false,
				'outline-none': false
			}
		},

        // Clears files and folders.
        // https://github.com/gruntjs/grunt-contrib-clean
		'clean': {
			'dist': '<%= meta.dist_destination %>',
            'post_dist': ['<%= meta.dist_destination %>/*.css', '<%= meta.dist_destination %>/*.js'],
			'dev': '<%= meta.dev_destination %>',
			'tmp': '<%= meta.tmp_destination %>',
			'coverage': '<%= meta.coverage_destination %>'
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
                            '<%= meta.vendor_components %>',
                            '<%= meta.compiled_html %>',
                            '<%= meta.stylesheets %>'
                        ],
                        'dest': '<%= meta.dev_destination %>'
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
				'mangle': false,
				'compress': true,
				'sourceMap': false,
				'preserveComments': false,
                'ASCIIOnly': true
			},
			'dist': {
				'files': {
					'<%= meta.tmp_destination %>/<%= pkg.namelower %>.min.js': ['<%= meta.tmp_destination %>/vendorDefaults.js', '<%= meta.source %>', '<%= meta.vendorComponents %>', '<%= meta.compiledHtml %>'],
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
				'src': ['<%= meta.htmlViews %>', '<%= meta.htmlDirectives %>'],
				'dest': '<%= meta.compiledHtml %>'
			}
		},

        'replace': {
            'dev': {
                'options': {'patterns': [
                    {'match': 'vendorName', 'replacement': getPrimaryVendor(getVendors()).name},
                    {'match': 'vendorLogo', 'replacement': getBase64(getPrimaryVendor(getVendors()).options.logo)},
                    {'match': 'vendorIcon', 'replacement': getBase64(getPrimaryVendor(getVendors()).options.icon)},
                    {'match': 'primaryPalette', 'replacement': getPrimaryVendor(getVendors()).options.primaryPalette},
                    {'match': 'accentPalette', 'replacement': getPrimaryVendor(getVendors()).options.accentPalette},
                    {'match': 'debugEnabled', 'replacement': true}
                ]},
                'files': [
                    {'expand': true, 'flatten': true, 'src': 'vendorDefaults.js', 'dest': '<%= meta.dev_destination %>'}
                ]
            },
            'dist': {
                'options': {'patterns': [
                    {'match': 'vendorName', 'replacement': getPrimaryVendor(getVendors()).name},
                    {'match': 'vendorLogo', 'replacement': getBase64(getPrimaryVendor(getVendors()).options.logo)},
                    {'match': 'vendorIcon', 'replacement': getBase64(getPrimaryVendor(getVendors()).options.icon)},
                    {'match': 'primaryPalette', 'replacement': getPrimaryVendor(getVendors()).options.primaryPalette},
                    {'match': 'accentPalette', 'replacement': getPrimaryVendor(getVendors()).options.accentPalette},
                    {'match': 'debugEnabled', 'replacement': false}
                ]},
                'files': [
                    {'expand': true, 'flatten': true, 'src': 'vendorDefaults.js', 'dest': '<%= meta.tmp_destination %>'}
                ]
            }
        }

	});
	
	grunt.registerTask('default', [
        'develop'
    ]);

	grunt.registerTask('develop', 'Lints and tests JavaScript files, processes HTML and finally starts HTTP server which autoreloads on file changes.', [
	    'jshint:dev',
	    'csslint:dev',
	    'clean:dev',
        'replace:dev',
	    'bower-install-simple:dev',
	    'bower:dev',
	    'html2js',
	    'copy:dev',
	    'cssmin:dev',
	    'karma:dev',
	    'processhtml:dev',
	    'wiredep:dev',
	    'express:dev',
	    'open:server',
	    'watch'
	]);

	grunt.registerTask('dist', 'Generates tested and linted minified JavaScript and CSS files with HTML templates included in JavaScript.', [
	    'jshint:dist',
	    'csslint:dist',
	    'clean:dist',
        'replace:dist',
	    'bower-install-simple:dist',
        'bower_concat:dist',
	    'html2js',
	    'uglify:dist',
	    'karma:dist',
	    'cssmin:dist',
        'processhtml:dist',
        'clean:post_dist'
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
        'jshint',
        'csslint:dev',
        'html2js',
        'karma:dev'
    ]);

    grunt.registerTask('coverage', 'Generates and opens test coverage.', [
        'karma:coverage',
        'open:coverage'
    ]);

};