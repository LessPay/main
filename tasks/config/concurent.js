module.exports = function(grunt) {
    grunt.config.set('concurrent' , {
        dev: {
            //tasks: ['watch:assets', 'nodemon:dev', 'node-inspector:dev'],
            tasks: ['watch:assets', 'nodemon:dev'],
            options: {
              logConcurrentOutput: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-concurrent');
};
