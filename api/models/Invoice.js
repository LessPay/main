/**
* Admin.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

// 1 - activated, 2- rejected


var _ = require('lodash');

module.exports = {

    attributes: {
        owner : {
            required: true,
            model : 'User'
        },
        
        to : {
            model : 'User'
        },

        status : {
            type: 'boolean',
            required: true,
            defaultsTo: 0,
        },

        transaction : {
            type: 'string',
        },

        amount : {
            type : 'string',
            required : true
        },

        // fee : {
        //     type : 'string'
        // },

        lifetime : {
            type : 'datetime'
        },

        code : {
            type : 'string',
            enum : ['BTC', 'LTC', 'ANI', 'DOGE', 'LP'],
            required: true
        },

        comment : {
            type : 'string',
            maxLength : 150
        },

        prefix : 'string',
        href : 'string',
        address_type : 'string',
        address : 'string'
    },
   
    beforeValidation : function  (invoice, done) {
        
        if(!invoice.lifetime) {
            var current_time = new Date()
            current_time.setDate(current_time.getDate() + 2)
            
            invoice.lifetime = current_time;
        }


        done(null ,invoice);
    },

    afterCreate : function  (invoice, done) {
        
        var send_data = _.chain(invoice).omit(['owner', 'to']).value();

        sails.sockets.broadcast(invoice.owner, 'invoice:created',  send_data); 
        sails.sockets.broadcast(invoice.to, 'invoice:created',  send_data); 
        done(null, null);
    },

    afterUpdate : function  (invoice, done) {

        var send_data = _.chain(invoice).omit(['owner', 'to']).value();

        sails.sockets.broadcast(invoice.owner, 'invoice:updated',  send_data); 
        sails.sockets.broadcast(invoice.to, 'invoice:updated',  send_data); 
        done(null, null);
    }
};

