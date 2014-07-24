/**
 * AuthController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */


var passport = require('passport')
, async = require('async')
, bcrypt = require('bcryptjs')
, _ = require('lodash');

function closeWindow (req, res) {
	if(req.user) {
		UserService.add(req.user.id, req.session.socket_id);

		User.findOne({ id : req.user.id }).exec(function (err, user) {


			user.online = 1;
			user.save(function (err, user) {
				return res.view({ user : user });
			})
		})
	}
}










function UserLoginLocal (customer_id, password, done) {
	User.findOne({ customer_id :  customer_id })
	.exec(function (err, user) {
		if(err || !user) return done(err, null);
		var userPass = user.password;

		bcrypt.compare(password, userPass, function (err, res) {	
			if (err || !res) return done(null, null);
			
			user.online = 1;
			user.save(function (err, user) {
				if(err) return done(err, null);

				return done(null, user);
			});
		});
	})
}






module.exports = {

	_config: {},

	index : function (req, res, next) {
		if(!req.user) 
			return res.serverError(
				res.i18n('User is not logged')
			);

		res.json(req.user);
	},
	
	restore : function (req, res) {
		var restore_type = req.param('template');

		var error_message, data ;

		switch(restore_type) {
			case 'customer_id': 
				data = req.param('customer_id');
				error_message = data ? 'That\'s CustomerID doesn\'t exist.' : 'Field CustomerID is required.'; 
				break;
			
			case 'email': 
				data = req.param('email');
				error_message = data ? 'That\'s email doesn\'t exist. <a href="/frontpage/registration/%s">You can register.</a>' : 'Field Email is required.'; 
				break;
			
			default : 
				return res.serverError(
					res.i18n('Unknown restore method!')
				)
		}

		if(!data) 
			return res.serverError(
				res.i18n(error_message, { 'data' : data})
			);

		User.findOne(
			{ or: [
				{customer_id: data || 'none'},
				{email: data || 'none'}
	  		] 
  		})
		.exec(function  (err, user) {
			if(err) return res.serverError(err);
			
			console.log(user);

			if(!user) 
				return res.serverError(
					res.i18n(error_message,  data)
				);

			user.resetPassword(function (err, user) {
				if(err) return res.serverError(err);				
				res.send({ success : 1 });
			});			
		});
	}
	, login: function (req, res) {		
		if(req.user) return next();	

		var data = req.params.all();

		if(!data.customer_id || !data.password) 
			return res.serverError(
				res.i18n("Not specified Customer ID or password.")
			);

		UserLoginLocal(data.customer_id, data.password, function (err, user) {
			if(err) return res.serverError(err); 
			
			if(!user) 
				return res.serverError(
					res.i18n("User doesn't exist")
				); 

			req.logIn(user, function (err) {
				
				if(err) return res.serverError(err);

				res.send(user);
			});
		});
	}


	, logout : function (req, res) {

		if(req.user){

			User.findOne(req.user.id, function (err, user) {
				user.online = 0;

				user.save(function (err, user) {
					req.logout();
					res.redirect('/');
				});

			});

		} else {

			req.logout();
			res.redirect('/');
		}


	}

	, activation : function (req, res) {
		
		res.json('Activation method is not yet implemented');
	}
	
	, registration : function (req, res, next) {
		var new_user = {};


		var email = req.param('email')
		, accountType = req.param('accountType') || 'client'
		, password = req.param('password') ;

		
		if(!email) 
			return res.serverError(
					res.i18n('Email is required.')
				);

		new_user['email'] = email;




		if(['client', 'store'].indexOf(accountType) === -1)
			return res.serverError(
					res.i18n('Unknown account type.')
				);

		new_user['accountType'] = accountType;

		if(password) {
			if(password.length < 5 || password.length > 12)
				return res.serverError(
						res.i18n('Password length must be at least 5 and no more than 12 characters')
					);

			new_user['password'] = password;
		}

		async.auto({
			check_user : function  (done) {

				User.findOne({ 'email' : email }).exec(done);

			},
			user : ['check_user', function  (done, data) {
				if(data.check_user) 
					return done(
						res.i18n('Email already exists. <a href="/frontpage/restore/email/%s"  class="text bold white">Restore password</a>', 'xosito@coldemail.info')
					);
				
				User.create(new_user, done);
			}]
		},

		function  (errors, data) {
			if(errors) return res.serverError(errors);

			AccountService.makeDefaults(data.user, function (err, accounts) {
				req.logIn(data.user, function (err) {					
					if(err) return res.serverError(err);
					return res.json({ 'success' : '1' });
				});	
			});

		});
	

	}



, close : closeWindow

, vkontakte :  passport.authenticate('vkontakte', { display : 'popup'})
, vkontakteCB :  passport.authenticate('vkontakte', { failureRedirect: '/auth/close', successRedirect: '/auth/close' })

, twitter :  passport.authenticate('twitter')
, twitterCB :  passport.authenticate('twitter', { failureRedirect: '/auth/close', successRedirect: '/auth/close' })

, facebook :  passport.authenticate('facebook')
, facebookCB :  passport.authenticate('facebook', { failureRedirect: '/auth/close', successRedirect: '/auth/close' })

, google :  passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' })
, googleCB :  passport.authenticate('google', { failureRedirect: '/auth/close', successRedirect: '/auth/close' })

, odnoklassniki :  passport.authenticate('odnoklassniki')
, odnoklassnikiCB :  passport.authenticate('odnoklassniki', { failureRedirect: '/auth/close', successRedirect: '/auth/close' })

, mailru :  passport.authenticate('mailru')
, mailruCB :  passport.authenticate('mailru', { failureRedirect: '/auth/close', successRedirect: '/auth/close' })

, yandex :  passport.authenticate('yandex')
, yandexCB :  passport.authenticate('yandex', { failureRedirect: '/auth/close', successRedirect: '/auth/close' })

, persona :  passport.authenticate('persona', { failureRedirect: '/close', successRedirect: '/close' })


};
