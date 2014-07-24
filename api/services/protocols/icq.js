'use strict';

var oscar = require('oscar');
var util = require('util');
var _ = require('lodash');


var ICQ = function (connection, done) {
	var me = this;

	this.__connected = false;
	this.__offline_msgs = [];


	this.aim = new oscar.OscarConnection({
		connection: _.merge({}, { host: oscar.SERVER_ICQ }, connection) 
	});

	this.aim.on('end', function  () {
		console.log('OSCAR disconnected');

		me.__connected == false;
	})

	this.aim.on('error', console.error);


	this.connect(done);

}

ICQ.prototype.disconnect = function () {
	this.__connected == false;
	this.aim.end();
}

ICQ.prototype.connect = function  (done) {
	var me = this;

	me.aim.connect(function (err) {
		if(err) return console.error(err);

		//console.log('ICQ online');
		me.__connected = true;
		if(done) done(err);

		//TODO send offline message
	
	})



}


ICQ.prototype.send = function  (locals, done) {
	var me  = this;
	if(!this.__connected) {
		//return false;
		//this.__offline_msgs.push(arguments);
		//return cb('Not connected', null);

		return me.connect(function  () {
			me.aim.sendIM(locals.to, locals.text);
			done();

		})
	}

	this.aim.sendIM(locals.to, locals.text);
	done();
}


module.exports = ICQ;