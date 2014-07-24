/**
* Admin.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
        owner : {
            type: 'string',
            required: true
        },
        
        contact_type : {
            type: 'string',
            required: true,
            enum : ['jid', 'icq', 'phone']
        },

        value : {
            type: 'string',
            required: true,
        },

        verified : {
            type: 'boolean',
            defaultsTo: false,
            required: true
        }
    }
};

