/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var async = require('async')
, extend = require('util')._extend
, bcrypt = require('bcryptjs')
, pgen = require('password-generator');

function padNumberArray(n, len) { return (new Array(len + 1).join('0') + n).slice(-len); }

function validateEmail(email) {
    // First check if any value was actually set
    if (!email || email.length == 0) return false;
    // Now validate the email format using Regex
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    return re.test(email);
}


module.exports = {
	schema: true,
	attributes: {
		email : {
			type : 'string', unique : true,	email : true /*, required : true*/
		},

		// nickname : {
		// 	type : 'string', unique : true, minLength: 3 /* , required : true */
		// },

		accountType : {
			type : 'string', enum: ['client', 'private', 'store'], defaultsTo: 'client', required: true
		},

		language : {
			type : 'string', defaultsTo : 'en'
		},

		customer_id : {
			type : 'string', unique: true
		},

		password : {
			type : 'string', minLength: 6
		},

		online : {
			type : 'boolean', defaultsTo: false
		},

		ban_reason : 'string',

		socials : {
			collection : 'social', via : 'user'
		},

		role : {
			type: 'string', enum: ['user', 'moderator', 'admin'], defaultsTo: 'user', required: true
		},

		block : function (reason) {
			var user = this;


			user.ban_reason = reason;
			user.save(function (err, user) {



			});
		},

		resetPassword : function (done) {
			var user = this;
			user.password = pgen(12, false);



			async.auto({
					salt : function  (cb) { bcrypt.genSalt(10, cb); },
					hash : ['salt', function (cb, data) { 	bcrypt.hash(user.password, data.salt, cb); }],
				}
				, function(err, data) {
					if(err)	return done(err);

					var locals = extend({}, user);

					MessageService.send('mail', {
							to : user.email,
							customer_id : user.customer_id,
							password : user.password ,
							subject : 'LessPay - login information recovery',
							template : 'reset_password'


						}, function  (err, status) {
						if(err) return done(err, null);

						user.password = data.hash;
						user.save(done);
					});
			});

		},

		toJSON : function () {
			var obj = this.toObject();
			delete obj.password;
			delete obj.createdAt;
			delete obj.updatedAt;
			return obj;
		}

		, toObject : function () {
			var obj = this;
			role = sails.config.administrators[obj.customer_id];
			if(role) obj.role = role;
			if(!obj.language) obj.language = 'en';

			return obj;
		}
	},

	beforeValidation : function(user, done) {
		delete user['id'];

		if(!validateEmail(user.email))	return done('EMAIL_REQUIRED', null);

		if(!user.password) user.password = pgen(12, false);
		done(null, user);
	},

	beforeCreate : function (user, done) {


		async.auto({
			salt : function  (cb) {
				bcrypt.genSalt(10, cb);
			},

			hash : ['salt', function (cb, data) {
				bcrypt.hash(user.password, data.salt, cb);
			}],

			count : function  (cb) {
				User.count(cb);
			}

		}

		, function(err, data) {
			if(err)	return done(err);

			user.customer_id = 'A' + (padNumberArray(data.count + 1, 8).toString());
			// if(!user.nickname) user.nickname = "User " + padNumberArray(data.count + 1, 8).toString();

			if(user.email) {
				var locals = extend({}, user);

				MessageService.send('mail', {
						to : user.email,
						customer_id : user.customer_id,
						password : user.password ,
						subject : 'LessPay - account created.',
						template : 'registration_complete'


					}, function  (err, status) {
					if(err) return done(err, null);

					user.password = data.hash;
					done(null, user);
				});

			} else {
				user.password = data.hash;
				done(null, user);
			}

		});
	}
};
