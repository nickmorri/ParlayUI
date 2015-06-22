module.exports = function (grunt) {

  // Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

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
      'dev': {
        'options': {
          'port': 9000,
          'hostname': '0.0.0.0',
          'bases': ['<%= meta.dev_destination %>'],
          'livereload': true
        }
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
        'tasks': ['copy:dev']
      },
      'html': {
        'options': {
          'livereload': true
        },
        'files': ['<%= meta.htmlDirectives %>', '<%= meta.htmlPartials %>', 'index.html'],
        'tasks': ['copy:dev']
      }
    },

    'open': {
      'dev': {
        'path': 'http://localhost:<%= express.dev.options.port %>'
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

    'clean': {
      'dist': '<%= meta.dist_destination %>',
      'dev': '<%= meta.dev_destination %>',
      'doc': '<%= meta.doc_destination %>'
    },

    'copy': {
      'dist': {
        'files': [
          {'expand': true, 'src': '<%= meta.htmlDirectives %>', 'dest': '<%= meta.dist_destination %>'},
          {'expand': true, 'src': 'bower_components/angular-material/angular-material.css', 'dest': '<%= meta.dist_destination %>'},
          {'expand': true, 'src': '<%= meta.bowerComponents %>', 'dest': '<%= meta.dist_destination %>'},
          {'expand': true, 'src': '<%= meta.htmlPartials %>', 'dest': '<%= meta.dist_destination %>'}
        ]
      },
      'dev': {
        'files': [
          {'expand': true, 'src': '<%= meta.source %>', 'dest': '<%= meta.dev_destination %>'},
          {'expand': true, 'src': 'index.html', 'dest': '<%= meta.dev_destination %>'},
          {'expand': true, 'src': 'bower_components/angular-material/angular-material.css', 'dest': '<%= meta.dev_destination %>'},
          {'expand': true, 'src': '<%= meta.bowerComponents %>', 'dest': '<%= meta.dev_destination %>'},
          {'expand': true, 'src': '<%= meta.htmlDirectives %>', 'dest': '<%= meta.dev_destination %>'},
          {'expand': true, 'src': '<%= meta.htmlPartials %>', 'dest': '<%= meta.dev_destination %>'},
          {'expand': true, 'src': '<%= meta.stylesheets %>', 'dest': '<%= meta.dev_destination %>'},
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
    'open:dev',
    'watch'
  ]);

  grunt.registerTask('test', ['karma:development']);

  grunt.registerTask('build', [
    'clean:dist',
    'jshint:source',
    'karma:dev',
    'concat:dist',
    'karma:dist',
    'uglify:dist',
    'karma:minified',
    'copy:dist',
    'cssmin:dist',
    'processhtml:dist',
    'jsdoc'    
  ]);

  grunt.registerTask('default', ['build']);

};