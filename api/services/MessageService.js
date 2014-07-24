'use strict';

var request = require('request');

var Message = function () { }

Message.prototype.send = function (protocol, locals, done) {
	locals.protocol = protocol;
	request.post('http://localhost:1337/send', { form : locals }, done);
}

module.exports = new Message();




