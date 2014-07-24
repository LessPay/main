'use strict';


var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy
, VKontakteStrategy = require('passport-vkontakte').Strategy
, MailRUStrategy = require('passport-mailru').Strategy
, FacebookStrategy = require('passport-facebook').Strategy
, TwitterStrategy = require('passport-twitter').Strategy
, OdnoklassnikiStrategy = require('passport-odnoklassniki').Strategy
, YandexStrategy = require('passport-yandex').Strategy
//, PersonaStrategy = require('passport-persona').Strategy

, bcrypt = require('bcryptjs');

//VK, MoiMir, Google+, Odnoklassniki, Yandex

//var GooglePlusStrategy = require('passport-google-plus');
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GoogleStrategy = require('passport-google').Strategy;

var pgen = require('password-generator')
, async = require('async')
, casual = require('casual'); 

passport.serializeUser(function (user, done) { 
	done(null, user.id); 
});


passport.deserializeUser(function (id, done) { 
	User.findOne(id).exec(done); 
});





/*passport.use(
	new LocalStrategy({
		usernameField: 'email',
		passwordField: 'passwd'
	},
		function  (email, password, done) {

		User.findOne({ where:
			{ or: [{ email : email }, { login: email }] }
		})
		.done(function (err, user) {
			if(err) return done(err, null);
			if (!user) return done(null, null, {  message: 'Unknown user ' + email });

			bcrypt.compare(password, user.password, function (err, res) {
				if (!res) return done(null, null, {  message: 'Invalid Password' });
				user.online = 1;
				user.save(function (err, user) {
					return done(null, user, { message: 'Logged In Successfully'  });
				});
			});
		})
	})
);*/

//TODO save raw social data


function prepareProfile (profile) {
	var prepProfile = {
		//data : profile,
		sid : profile.id.toString(),
		//nickname : profile.username || casual.username,
		provider : profile.provider
	};

	return prepProfile;
}


function socLogin (req, accessToken, refreshToken, profile, done) {

	async.waterfall([
		function  (cb) { Social.findOne({ "provider" : profile.provider , "sid" : profile.id.toString() }).populate('user').exec(cb) },

		function (savedProfile, cb) {
			if(savedProfile) return cb(null, savedProfile.user);
			var prepProfile = prepareProfile(profile);

			if(!req.user) {
				User.create({ nickname : prepProfile.nickname	}, function (err, user) {
					if(err) return cb(err, null);
					prepProfile['user'] = user.id;						
					Social.create(prepProfile, function (err, profile) {  cb(err, user) });
				});
			}
			else {
				prepProfile['uid'] = req.user.id;
				
				Social.create(prepProfile, function (err, profile) {
					cb(err, err ? null : req.user);
				});
			}


			
		}
	], done);

}

passport.use(new GoogleStrategy({
	/*clientID: '752340238776-trsaggvkrg50o5kuug1a3h1b5na959aa.apps.googleusercontent.com',
	clientSecret: 'B8vuTKQCixh2RkAWzOGNJMyt',
	
	callbackURL:  "http://anbit.tk/auth/google/callback",*/
	returnURL:  "http://anbit.tk/auth/google/callback",
	passReqToCallback: true,
	realm: 'http://anbit.tk/'
  },
  function (req, url, profile_data, done) {
  	var tmp =  url.split('='),
	ident = tmp[1];

  	var profile = {
  		provider : 'google',
  		id : ident,
  		'_json' : profile_data
  	}

  	socLogin(req, ident, null, profile, done);
  }


));




passport.use(new VKontakteStrategy({
	clientID:     4355256,
	clientSecret: 'o3ez2Ob4drtywbjuw4ug',
	callbackURL:  "http://anbit.tk/auth/vkontakte/callback",
	passReqToCallback: true
  }, socLogin));


passport.use(new TwitterStrategy({
		consumerKey: 'Cxo3keMzOcaLo5k0qRXlL8q1c',
		consumerSecret: 'tdrCKgeilGCByWYpAUjU5GJYaU4wQpKkvJP6zzRFtectHBodHb',
		callbackURL: "http://anbit.tk/auth/twitter/callback",
		passReqToCallback: true
	},
	socLogin
));


passport.use(new FacebookStrategy({
	clientID: '639630389454135',
	clientSecret: '2f13db2f58d2b505f95874a617730557',
	callbackURL: "http://anbit.tk/auth/facebook/callback",
	passReqToCallback: true
  },
  socLogin
));


passport.use(new MailRUStrategy({
	clientID: '717344',
	clientSecret: 'cfc0af0e115fa9f1aab31819cd57fccd',
	callbackURL: "http://newboard.tk/auth/mailru/callback",
	passReqToCallback: true
  },
  socLogin
));




passport.use(new OdnoklassnikiStrategy({
    clientID: 217465344,
    clientPublic: 'CBADEHPNABABABABA',
    clientSecret: '48B34AD725AF79FC7B55DEA9',
    callbackURL: "http://newboard.tk/auth/odnoklassniki/callback",
	passReqToCallback: true
  },
  socLogin
));

passport.use(new YandexStrategy({
    clientID: 'bfa926eb009240a2b142aa4d939e462e',
    clientSecret: '036482b1b72548659ef6c7af655c0f42',
    callbackURL: "http://newboard.tk/auth/yandex/callback",
	passReqToCallback: true
  },
  socLogin
));



/*
passport.use(new PersonaStrategy({
	audience: ''
  },
  function(email, done) {
	//console.log(email);
	//User.findByEmail({ email: email }, function (err, user) {
	//  return done(err, user);
	//});

	return done(null, null);
  }
));
passport.use(new GooglePlusStrategy({
	clientId: '752340238776-trsaggvkrg50o5kuug1a3h1b5na959aa.apps.googleusercontent.com',
	clientSecret: 'B8vuTKQCixh2RkAWzOGNJMyt',
	passReqToCallback: true,
	callbackURL:  "http://anbit.tk/auth/google/callback"
  },
  function (tokens, profile, done) {
	//socLogin(null, tokens, profile done);
	console.log(tokens, profile);
	done(null, null);
  }


));

*/

module.exports = passport;