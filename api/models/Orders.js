/**
* Orders.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var _ = require('lodash');

var shift = 100000000;

module.exports = {

	attributes: {
        transaction : {
            type : 'string',
            required: true
        },

		amount : {
            type : 'integer',
            required: true,
            notNull : true
        },
        
        owner : {
            type : 'string',
            required: true
        },

        code : {
        	type : 'string',
        	required: true
        },

        account : {
            type : 'string',
            required: true
        },

        type : {
            type : 'string',
            enum : ['debet', 'credit'],
            required: true
        },

        address_type : {
        	type : 'string',
        	enum : ['account', 'wallet', 'voucher', 'invite'],
        	required: true
        },

        address : {
        	type: 'string',
        	//required: true
        },

        fee : {
        	type : 'integer',
            required: true,
            notNull : true
        },
        
        toJSON : function () {
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
	},

    afterCreate : function (order, done) {
        AccountService.updateUserBalance(order.owner, order.account, done);
    }
};

