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
      'destination': 'dist',
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
      'stylesheets': ['css/*.css', 'bower_components/angular-material/angular-material.css']
    },

    'express': {
      'all': {
        'options': {
          'port': 9000,
          'hostname': '0.0.0.0',
          'bases': ['<%= meta.destination %>'],
          'livereload': true
        }
      }
    },

    'watch': {
      'scripts': {
        'options': {
          'livereload': false
        },
        'files': '<%= meta.source %>',
        'tasks': ['jshint', 'concat', 'uglify']
      },
      'stylesheets': {
        'options': {
          'livereload': false
        },
        'files': '<%= meta.stylesheets %>'
      },
      'html': {
        'options': {
          'livereload': false
        },
        'files': ['<%= meta.htmlDirectives %>', '<%= meta.htmlPartials %>', 'index.html']
      }
    },

    'open': {
      'all': {
        'path': 'http://localhost:<%= express.all.options.port %>'
      }
    },

    'karma': {
      'development': {
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
            '<%= meta.destination %>/<%= pkg.namelower %>-<%= pkg.version %>.js',
            '<%= meta.tests %>'
          ]
        }
      },
      'minified': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '<%= meta.bowerComponents %>',
            '<%= meta.destination %>/<%= pkg.namelower %>-<%= pkg.version %>.min.js',
            '<%= meta.tests %>'
          ],
        }
      }
	},

  'jshint': {
    'beforeconcat': ['<%= meta.source %>']
  },

  'clean': {
    'build': ['<%= meta.destination %>']
  },

  'copy': {
    'build': {
      'files': [
        {'expand': true, 'src': ['<%= meta.htmlDirectives %>'], 'dest': '<%= meta.destination %>'},
        {'expand':true, 'src': 'index.html', 'dest': '<%= meta.destination %>'},
        {'expand':true, 'src': '<%= meta.bowerComponents %>', 'dest': '<%= meta.destination %>'},
        {'expand':true, 'src': '<%= meta.htmlPartials %>', 'dest': '<%= meta.destination %>'},
        {'expand':true, 'src': '<%= meta.stylesheets %>', 'dest': '<%= meta.destination %>'}
      ]
    }
  },

  'concat': {
    'dist': {
      'src': ['<%= meta.source %>'],
      'dest': '<%= meta.destination %>/<%= pkg.namelower %>-<%= pkg.version %>.js'
    }
  },

  'uglify': {
      'options': {
        'mangle': false
      },  
      'dist': {
        'files': {
          '<%= meta.destination %>/<%= pkg.namelower %>-<%= pkg.version %>.min.js': ['<%= meta.destination %>/<%= pkg.namelower %>-<%= pkg.version %>.js']
        }
      }
    },

    'jsdoc': {
      'src': ['<%= meta.source %>'],
      'options': {
        'destination': 'doc'
      }
    }

  });

  grunt.registerTask('server', [
    'express',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', ['karma:development']);

  grunt.registerTask('build', [
    'clean',
    'jshint',
    'karma:development',
    'concat',
    'karma:dist',
    'uglify',
    'karma:minified',
    'copy',
    'jsdoc'    
  ]);

  grunt.registerTask('default', ['build']);

};