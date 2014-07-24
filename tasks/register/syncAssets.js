module.exports = function (grunt) {
	grunt.registerTask('syncAssets', [		
		'bower:dev',
		'jst:dev',
		'less:dev',
		'sync:dev',
		'coffee:dev'
	]);
};
