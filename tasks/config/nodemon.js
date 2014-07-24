module.exports = function(grunt) {

    var APP_PORT = '3047';

    grunt.config.set('nodemon', {
        dev: {
            script: 'app.js',

            options: {
                //nodeArgs: ['--debug=3042'],
                nodeArgs: [],
                env: { 'PORT': APP_PORT },
                // omit this property if you aren't serving HTML files and 
                // don't want to open a browser tab on start
                watch : ['api/**/*', 'config'], 
                callback: function (nodemon) {
                    nodemon.on('log', function (event) {
                        console.log(event.colour);
                    });

                    // opens browser on initial server start
                    nodemon.on('config:update', function () {
                        // Delay before server listens on port
                        setTimeout(function() {
                            // require('open')('http://localhost:' + APP_PORT);
                        }, 3000);
                    });

                    // refreshes browser when server reboots
                    nodemon.on('restart', function () {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('fs').writeFileSync('.rebooted', 'rebooted');
                            }, 1000);
                    });
                }
            }
        }
    });


	grunt.loadNpmTasks('grunt-nodemon');
};
