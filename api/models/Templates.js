/**
* Admin.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
        name : {
            required: true,
            type: 'string'
        },

        order : {
            type: 'json',
            required: true
        },

        owner: {
            type: 'string',
            required: true
        },

        toJSON : function () {
            var me  = this;
            delete me.owner;
            return me;
        }
    }
};

