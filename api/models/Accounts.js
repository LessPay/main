/**
* Orders.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var _ = require('lodash');


module.exports = {

	attributes: {
		code : {
			type : 'string',
			enum: ['BTC', 'LTC', 'ANI', 'DOGE', 'LP'],
			required: true
		},
		owner : 'string',
		isDefault : {
			type : 'boolean',
			required: true,
			defaultsTo: false
		},
		name : {
			type : 'string',
			required: true
		},

		toJSON : function  () {
			var me = this;
			delete me.createdAt;
			delete me.updatedAt;
			delete me.owner;

			return me;
		}
	}
};

