module.exports = function (grunt) {
    //grunt.registerTask('devserver', ['compileAssets', 'linkAssets',  'watch']);

    grunt.registerTask('devserver', ['compileAssets', 'linkAssets',  'concurrent:dev']);
    //grunt.registerTask('devserver', ['compileAssets', 'concurrent:dev']);
};
