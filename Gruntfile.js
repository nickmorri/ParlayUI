module.exports = function (grunt) {
	
	/**
	 * Loads each vendor configuration file available in vendor_components
	 * @returns {Object} - key (vendor name) -> Object of vendor source paths.
	 */
	function getVendors () {
		return grunt.file.expand('vendor_components/**/vendor.json').map(function (vendor) {
			return grunt.file.readJSON(vendor);
	    }).reduce(function (accumulator, vendor) {
	        accumulator[vendor.name] = vendor.source;
	        return accumulator;
	    }, {});
	}
	
	/**
	 * Process vendor items and return an Array of Strings that Grunt can use.
	 * @param {Array} items - Component items we are searching for.
	 * @param {Array} initial - Any component we want to include explicitly.
	 * @returns {Array} - Array of all components we extracted from the vendor Object and explicitly included components.
	 */
	function getVendorItems (items, initial) {
		var vendors = getVendors();
		if (initial === undefined) initial = [];
		return initial.concat(Object.keys(vendors).reduce(function (accumulator, vendor)  {
			return accumulator.concat(Object.keys(vendors[vendor]).filter(function (key) {
				return items.some(function (item) { return key.indexOf(item) > -1; });
	        }).map(function (key) { return '<%= vendor.' + vendor + '.' + key + ' %>'; }));
	    }, []));
	}

	// Read the dependencies in package.json and load Grunt tasks that match the "grunt-*".
	require('load-grunt-tasks')(grunt);
	
	// Load this Grunt task individually since it doesn't match the "grunt-*" pattern.
    var mainBowerFiles = require('main-bower-files');
	grunt.loadNpmTasks('main-bower-files');

	grunt.initConfig({
    	'pkg': grunt.file.readJSON('package.json'),

		'vendor': getVendors(),

		'meta': {
			'source': ['app.js', 'parlay_components/*/*.js'],
			'vendorComponents': getVendorItems(['protocols', 'items']),
			'dist_destination': 'dist',
			'dev_destination': 'dev',
			'doc_destination': 'doc',
			'tmp_destination': 'tmp',
			'coverage_destination': 'coverage',
			'mocks': getVendorItems (['mocks'], ['parlay_components/*/mocks/*.js']),
			'tests': getVendorItems(['test'], ['parlay_components/*/test/*.js']),
			'compiledHtml': '<%= meta.tmp_destination %>/templates.js',
			'htmlDirectives': getVendorItems(['directives'], ['parlay_components/**/directives/*.html']),
			'htmlViews': 'parlay_components/**/views/*.html',
			'commonFiles': ['images/logo.png', 'images/icon.png'],
			'stylesheets': getVendorItems(['stylesheets'], ['css/*.css'])
		},
		
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
				'options': {
					'bases': ['<%= meta.dist_destination %>']
				}
			}
		},
		
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

		'bower': {
			'dist': {
				'base': 'bower_components',
				'dest': '<%= meta.dist_destination %>/bower_components',
				'options': {
					'checkExistence': true,
					'debugging': true,
					'paths': {
						'bowerDirectory': 'bower_components',
						'bowerrc': '.bowerrc',
						'bowerJson': 'bower.json'
            		}
				}
			},
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

		'wiredep': {
			'dist': {
				'src': '<%= meta.dist_destination %>/index.html'
			},
			'dev': {
				'src': '<%= meta.dev_destination %>/index.html'
			}
		},

	    'watch': {
		    'scripts': {
			    'options': {
				    'livereload': true
				},
				'files': ['<%= meta.source %>', '<%= meta.vendorComponents %>'],
				'tasks': ['newer:jshint:dev', 'karma:dev', 'newer:copy:dev']
			},
			'stylesheets': {
	        	'options': {
					'debounceDelay': 10,
					'livereload': true
				},
				'files': '<%= meta.stylesheets %>',
				'tasks': ['newer:csslint:dev', 'cssmin:dev']
			},
			'html': {
	        	'options': {
					'debounceDelay': 10,
					'livereload': true
				},
				'files': ['<%= meta.htmlDirectives %>', '<%= meta.htmlViews %>', 'index.html'],
				'tasks': ['newer:html2js', 'newer:copy']
			},
			'tests': {
	        	'files': '<%= meta.tests %>',
				'tasks': 'karma:dev'
			},
			'mocks': {
				'files': '<%= meta.mocks %>',
				'tasks': 'karma:dev'
			}
		},

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

		'karma': {
			'options': {
				'configFile': 'karma.conf.js',
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
					],
				}
			},
			'dist': {
				'options': {
					'reporters': ['progress'],					
					'files': [
                        mainBowerFiles(),
			            '<%= meta.dist_destination %>/<%= pkg.namelower %>.min.js',
			            '<%= meta.mocks %>',
			            '<%= meta.tests %>'
					],
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
					],
				}
			}
		},

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

		'csslint': {
			'dist': {
				'src': '<%= meta.stylesheets %>'
			},
			'dev': {
				'src': '<%= meta.stylesheets %>',
				'options': {
					'important': false,
					'adjoining-classes': false,
					'known-properties': false
				},
			}
		},
		
		'clean': {
			'dist': '<%= meta.dist_destination %>',
			'dev': '<%= meta.dev_destination %>',
			'doc': '<%= meta.doc_destination %>',
			'tmp': '<%= meta.tmp_destination %>',
			'coverage': '<%= meta.coverage_destination %>'
		},

		'copy': {
			'dist': {
		        'files': [
		        	{'expand': true, 'src': '<%= meta.commonFiles %>', 'dest': '<%= meta.dist_destination %>'}
		        ]
			},
			'dev': {
		        'files': [
					{'expand': true, 'src': ['<%= meta.source %>', '<%= meta.vendorComponents %>', '<%= meta.compiledHtml %>'], 'dest': '<%= meta.dev_destination %>'},
					{'expand': true, 'src': '<%= meta.commonFiles %>', 'dest': '<%= meta.dev_destination %>'}
				]
			}
		},

		'processhtml': {
			'dist': {
				'files': {'<%= meta.dist_destination %>/index.html': ['index.html']}
			},
			'dev': {
				'files': {'<%= meta.dev_destination %>/index.html': ['index.html']}
			}
		},

		'uglify': {
			'options': {
				'mangle': false,
				'compress': true,
				'sourceMap': true,
				'preserveComments': false,
			},
			'dist': {
				'files': {
					'<%= meta.dist_destination %>/<%= pkg.namelower %>.min.js': ['<%= meta.source %>', '<%= meta.vendorComponents %>', '<%= meta.compiledHtml %>']
				}
			}
		},

		'cssmin': {
			'options': {
	        	'shorthandCompacting': false,
				'roundingPrecision': -1
			},
			'dist': {
				'files': {'<%= meta.dist_destination %>/<%= pkg.namelower %>.min.css': '<%= meta.stylesheets %>'}
			},
			'dev': {
				'files': {'<%= meta.dev_destination %>/<%= pkg.namelower %>.min.css': '<%= meta.stylesheets %>'}
			}
		},

		'html2js': {
			'main': {
				'src': ['<%= meta.htmlViews %>', '<%= meta.htmlDirectives %>'],
				'dest': '<%= meta.compiledHtml %>'
			}
		}
		
	});
	
	grunt.registerTask('default', ['develop']);

	grunt.registerTask('develop', 'Lints and tests JavaScript files, processes HTML and finally starts HTTP server which autoreloads on file changes.', [
	    'jshint:dev',
	    'csslint:dev',
	    'clean:dev',
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

	grunt.registerTask('test', 'Lints and tests JavaScript files.', ['jshint', 'karma:dev']);
	
	grunt.registerTask('coverage', 'Generates and opens test coverage.', ['karma:coverage', 'open:coverage'])

	grunt.registerTask('dist', 'Generates tested and linted minified JavaScript and CSS files with HTML templates included in JavaScript.', [
	    'jshint:dist',
	    'csslint:dist',
	    'clean:dist',
	    'bower-install-simple:dist',
	    'bower:dist',
	    'html2js',
	    'karma:dev',
	    'uglify:dist',
	    'karma:dist',
	    'copy:dist',
	    'cssmin:dist',
	    'processhtml:dist',
	    'wiredep:dist'
	]);

	grunt.registerTask('build', ['dist']);

	grunt.registerTask('server', 'Launches HTTP server with distribution files as source.', [
	    'express:dist',
	    'open:server',
	    'express-keepalive'
	]);

};