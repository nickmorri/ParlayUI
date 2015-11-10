// Karma configuration
// Generated on Thu Jun 18 2015 10:24:38 GMT-0700 (PDT)

module.exports = function (config) {
	config.set({
		basePath: '', // Overwritten by Grunt.
		frameworks: ['jasmine'], // Frameworks to use. Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		port: 9876, // Web server port.
		colors: true, // Enable / disable colors in the output (reporters and logs).
		logLevel: config.LOG_WARN, // Level of logging. Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		autoWatch: true, // Enable / disable watching file and executing tests whenever any file changes.
		browsers: ['PhantomJS'], // Start these browsers. Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		singleRun: true // Continuous Integration mode. If true, Karma captures browsers, runs the tests and exits.
	});
};