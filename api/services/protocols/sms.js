'use strict';

var _ = require('lodash');
var util = require('util');

var request = require('request');
var crypto = require('crypto');
var md5sum = crypto.createHash('md5');



var SMS = function (connection) {
	connection.password = md5sum.update(connection.password).digest('hex');
	this.__connection = connection;
}


SMS.prototype.connect = function  () {
	
}

SMS.prototype.disconnect = function  () {
	
}

SMS.prototype.send = function (locals, done) {
	delete locals.type;

	var data = _.merge({}, this.__connection, locals);
	// console.log(data);
	
	request
	.post('https://gate.smsaero.ru/send/', done)
	.form(data);
}


module.exports = SMS;