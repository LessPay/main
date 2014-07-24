'use strict';

var _ = require('lodash');
var util = require('util');


var path           = require('path')
, templatesDir   = path.resolve(__dirname, '../../../', 'views/mails')
, emailTemplates = require('email-templates')
, nodemailer     = require('nodemailer');





var default_mail_conf = {};

var MAIL = function  (connection, done) {	

	this.transport = nodemailer.createTransport("SMTP", connection);
	//var transport = nodemailer.createTransport("sendmail");

}


MAIL.prototype.connect = function  () {
	
}

MAIL.prototype.disconnect = function  () {
	
}

MAIL.prototype.send = function  (locals, cb) {
	var me = this;

	var subject = locals.subject, language 	= locals.language || 'en';		
	locals.template	= (locals.template || 'test' )+ '_' + language ;



	emailTemplates(templatesDir, function(err, template) {
		if (err)  return cb(err, null);		

		template(locals.template, locals, function(err, html, text) {
			if (err)  return cb(err, null);					

			var mail_config = { 
				from: 'Lesspay team <noreply@anbit.tk>',  
				to: locals.to,  
				subject: subject, 
				html: html, 
				generateTextFromHTML: true, 
				//text: text	 
			};

			me.transport.sendMail(mail_config, cb);				
		});

	});	
}


module.exports = MAIL;