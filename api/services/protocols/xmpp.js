'use strict';

var _ = require('lodash');
var util = require('util');
var xmpp = require('node-xmpp');

var JABBER = function  (connection, done) {

	this.__connected = false;
	this.__connection = connection;
	this.connect(done);
}


JABBER.prototype.connect = function (done) {
	var me = this;

	this.client = new xmpp.Client( _.merge({}, { port: 5222, resource : 'test' }, me.__connection) );
	this.client.on('online', function () {
		this.__connected = true;

		if(done) done.apply(me, arguments);
	});
}

JABBER.prototype.disconnect = function () {
	this.client.disconnect()
}

JABBER.prototype.send = function(locals, done) {
	var me = this;

	var send = function  () {
		me.client.send(
			new xmpp
			.Element('message',{ to: locals.to, type: 'chat' })
			.c('body')
			.t(locals.text)
    	);

		return done();

    	me.client.on('stanza', function (stanza) {
			if(stanza.name !== 'message' ||  stanza.attrs.from !== locals.to ) return ;
			return stanza.attrs.type === 'error' ? done(stanza, null) : done(null, stanza);
		});

	}

	if(!this.__connected) return this.connect(send);

	send();    
}


module.exports = JABBER;