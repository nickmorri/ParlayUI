module.exports = function (grunt) {

  function getVendors () {
    return grunt.file.expand('vendor_components/**/vendor.json').map(function (vendor) {
        return grunt.file.readJSON(vendor);
    }).reduce(function (accumulator, vendor) {
        accumulator[vendor.name] = vendor.source;
        return accumulator;
    }, {});
  }

  function getVendorItems (items, initial) {
    var vendors = getVendors();
    if (initial === undefined) initial = [];
    var extracted = initial.concat(Object.keys(vendors).reduce(function (accumulator, vendor) {
        return accumulator.concat(Object.keys(vendors[vendor]).filter(function (key) {
            return items.some(function (item) {
              return key.indexOf(item) > -1;
            });
        }).map(function (key) {
            return '<%= vendor.' + vendor + '.' + key + ' %>';
        }));
    }, []));
    return extracted;
  }

  grunt.loadNpmTasks('main-bower-files');
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),

    'vendor': getVendors(),

    'meta': {
      'source': ['app.js', 'parlay_components/*/*.js'],
      'vendorComponents': getVendorItems(['protocols', 'endpoints']),
      'dist_destination': 'dist',
      'dev_destination': 'dev',
      'doc_destination': 'doc',
      'tmp_destination': 'tmp',
      'coverage_destination': 'coverage',
      'bowerComponents': [
        'bower_components/angular/angular.js',
        'bower_components/angular-messages/angular-messages.js',
        'bower_components/angular-material/angular-material.js',
        'bower_components/angular-material/angular-material-mocks.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/angular-aria/angular-aria.js',
        'bower_components/angular-material-icons/angular-material-icons.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/ace-builds/src/ace.js',
        'bower_components/ace-builds/src/mode-python.js',
        'bower_components/angular-ui-ace/ui-ace.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/es6-shim/es6-shim.js',
        'bower_components/angular-recursion/angular-recursion.js',
        'bower_components/angular-notification/angular-notification.js',
        'bower_components/moment/moment.js',
        'bower_components/angular-moment/angular-moment.js'
      ],
      'staticComponents': ['static_components/ng-websocket/ng-websocket.js'],
      'tests': getVendorItems(['tests'], ['parlay_components/*/test/*.js']),
      'compiledHtml': '<%= meta.tmp_destination %>/templates.js',
      'htmlDirectives': getVendorItems(['directives'], ['parlay_components/**/directives/*.html']),
      'htmlViews': 'parlay_components/**/views/*.html',
      'commonFiles': ['bower_components/angular-material/angular-material.css', 'bower_components/ace-builds/src/mode-python.js', 'static_components/ng-websocket/ng-websocket.js'],
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
          'directory': "bower_components"
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
          'debounceDelay': 100,
          'livereload': true
        },
        'files': '<%= meta.stylesheets %>',
        'tasks': ['newer:csslint:dev', 'newer:copy']
      },
      'html': {
        'options': {
          'debounceDelay': 100,
          'livereload': true
        },
        'files': ['<%= meta.htmlDirectives %>', '<%= meta.htmlViews %>', 'index.html'],
        'tasks': ['newer:html2js', 'newer:copy']
      },
      'tests': {
        'files': '<%= meta.tests %>',
        'tasks': 'karma:dev'
      }
    },

    'open': {
      'all': {
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
      'dev': {
        'configFile': 'karma.conf.js',
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
            '<%= meta.bowerComponents %>',
            '<%= meta.staticComponents %>',
            '<%= meta.compiledHtml %>',
            '<%= meta.source %>',
            '<%= meta.vendorComponents %>',
            '<%= meta.tests %>'
          ],
        }
      },
      'dist': {
        'options': {
          'reporters': ['progress'],
          'configFile': 'karma.conf.js',
          'files': [
            '<%= meta.bowerComponents %>',
            '<%= meta.staticComponents %>',
            '<%= meta.dist_destination %>/<%= pkg.namelower %>.min.js',
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
        'src': ['<%= meta.source %>', '<%= meta.vendorComponents %>']
      }
    },

    'csslint': {
      'dist': {
        'options': {
          'import': 2
        },
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

  grunt.registerTask('develop', [
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
    'open',
    'watch'
  ]);

  grunt.registerTask('test', ['jshint', 'karma:dev']);

  grunt.registerTask('dist', [
    'jshint:dist',
    'csslint:dev',
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

  grunt.registerTask('server', [
    'express:dist',
    'open',
    'express-keepalive'
  ]);

};
