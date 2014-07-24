/**
* Admin.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/


var shift = 100000000;


module.exports = {

    attributes: {
        accepted : {
            type : 'boolean',
            required : true,
            defaultsTo: true
        },

        amount : {
            type : 'integer',
            required: true,
            notNull : true
        },        

        fee : {
            type : 'integer',
            required: true,
            notNull : true
        },

        code : {
            type : 'string',
            required: true
        },

        from_user : {
            type : 'string',
        },
        
        from_account : {
            type : 'string',
        },

        to_user : {
            type : 'string',
        },

        to_account : {
            type : 'string',
        },

        type : {
            type : 'string',
            enum : ['account', 'wallet', 'voucher', 'invite'],
            required: true
        },

        transit_data : {
            type : 'json',
            // required: true
        },

        comment : {
            type: 'string',
            maxLength: 100
        }
        
        , toJSON : function () {
            var me = this;

            me.amount = me.amount / shift;
            me.fee = me.fee / shift;

            return me;

        }

        , toObject : function () {
            var me = this;

            // me.amount = me.amount / shift;
            // me.fee = me.fee / shift;

            return me;
        }
    } 
};

