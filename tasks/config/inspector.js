module.exports = function(grunt) {
    grunt.config.set('node-inspector' , {
        dev: {}
    });

    grunt.loadNpmTasks('grunt-node-inspector');
};
