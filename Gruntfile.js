module.exports = function (grunt) {

  grunt.loadNpmTasks('main-bower-files');
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.JSON'),

    'meta': {
      'source': [
        'app.js',
        'parlay_components/**/*.js'
      ],
      'dist_destination': 'dist',
      'dev_destination': 'dev',
      'doc_destination': 'doc',
      'bowerComponents': [
        'bower_components/angular/angular.js',
        'bower_components/angular-material/angular-material.js',
        'bower_components/angular-material/angular-material-mocks.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/angular-aria/angular-aria.js',
        'bower_components/angular-material-icons/angular-material-icons.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/ace-builds/src/ace.js',
        'bower_components/ace-builds/src/mode-python.js',
        'bower_components/angular-ui-ace/ui-ace.js',
        'bower_components/angular-websocket/angular-websocket.js',
        'bower_components/angular-mocks/angular-mocks.js'        
      ],
      'tests': 'test/**/*.js',
      'htmlDirectives': 'parlay_components/**/directives/*.html',
      'htmlPartials': 'partials/*.html',
      'stylesheets': 'css/*.css'
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
      }
    },

    'wiredep': {
      'dist': {
        'src': '<%= meta.dist_destination %>/index.html'
      }
    },

    'watch': {
      'scripts': {
        'options': {
          'livereload': true
        },
        'files': '<%= meta.source %>',
        'tasks': ['jshint:source', 'karma:dev']
      },
      'stylesheets': {
        'options': {
          'livereload': true
        },
        'files': '<%= meta.stylesheets %>',
        'tasks': ['newer:copy']
      },
      'html': {
        'options': {
          'livereload': true
        },
        'files': ['<%= meta.htmlDirectives %>', '<%= meta.htmlPartials %>', 'index.html'],
        'tasks': ['newer:copy']
      }
    },

    'open': {
      'all': {
        'path': 'http://localhost:<%= express.options.port %>'
      }
    },

    'karma': {
      'dev': {
        'configFile': 'karma.conf.js',
        'options': {
          'files': [
            '<%= meta.bowerComponents %>',
            '<%= meta.source %>',
            '<%= meta.tests %>'
          ],
        }
      },
      'dist': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '<%= meta.bowerComponents %>',
            '<%= meta.dist_destination %>/<%= pkg.namelower %>.js',
            '<%= meta.tests %>'
          ]
        }
      },
      'minified': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '<%= meta.bowerComponents %>',
            '<%= meta.dist_destination %>/<%= pkg.namelower %>.min.js',
            '<%= meta.tests %>'
          ],
        }
      }
	  },

    'jshint': {
      'source': '<%= meta.source %>',
      'gruntfile': 'Gruntfile.js'
    },

    'csslint': {
      'strict': {
        'options': {
          'import': 2
        },
        'src': '<%= meta.stylesheets %>'
      },
      'lax': {
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
      'doc': '<%= meta.doc_destination %>'
    },

    'copy': {
      'all': {
        'files': [
          {'expand': true, 'src': ['<%= meta.htmlPartials %>', '<%= meta.htmlDirectives %>', 'bower_components/angular-material/angular-material.css', 'bower_components/ace-builds/src/mode-python.js'], 'dest': '<%= meta.dist_destination %>'}
        ]
      },
      'dev': {
        'files': [
          {'expand': true, 'src': ['<%= meta.source %>', '<%= meta.bowerComponents %>', 'index.html', '<%= meta.htmlDirectives %>', '<%= meta.htmlPartials %>', '<%= meta.stylesheets %>', 'bower_components/angular-material/angular-material.css'], 'dest': '<%= meta.dev_destination %>'}
        ]
      }
    },

    'processhtml': {
      'dist': {
        'files': {'<%= meta.dist_destination %>/index.html': ['index.html']}
      }
    },

    'concat': {
      'dist': {
        'src': ['<%= meta.source %>'],
        'dest': '<%= meta.dist_destination %>/<%= pkg.namelower %>.js'
      }
    },

    'uglify': {
      'options': {
        'mangle': false
      },  
      'dist': {
        'files': {
          '<%= meta.dist_destination %>/<%= pkg.namelower %>.min.js': ['<%= meta.dist_destination %>/<%= pkg.namelower %>.js']
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
      }
    },

    'jsdoc': {
      'src': ['<%= meta.source %>'],
      'options': {
        'destination': '<%= meta.doc_destination %>'
      }
    }

  });

  grunt.registerTask('develop', [
    'jshint',
    'clean:dev',
    'karma:dev',
    'copy:dev',
    'express:dev',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', ['karma:development']);

  grunt.registerTask('dist', [
    'clean:dist',
    'bower-install-simple:dist',
    'bower',
    'jshint:source',
    'csslint:lax',
    'karma:dev',
    'concat:dist',
    'karma:dist',
    'uglify:dist',
    'karma:minified',
    'copy:all',
    'cssmin:dist',
    'processhtml:dist',
    'wiredep:dist',
    'jsdoc'    
  ]);

  grunt.registerTask('build', ['dist']);

  grunt.registerTask('server', [
    'build',
    'express:dist',
    'open',
    'watch'
  ]);

};