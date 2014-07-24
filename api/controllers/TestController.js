/**
 * TestController
 *
 * @description :: Server-side logic for managing tests
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var _ = require('lodash')
, async = require('async');






module.exports = {
	messages : function  (req, res) {
		function render(err, data) {
			res.view();
		}
		
		

		if(req.method === 'POST') {
			return MessageService.send(req.param('type'), req.params.all(), render);
		}
		
		render();

		
	},

	send : function (req, res) {
		if(req.method === 'POST') {

			var code = req.param('code');

			var wallet = WalletService.code(code);

			wallet.send('MAIN', req.param('address'), req.param('amount'), function (err, data) {
				console.log(err, data);
				res.redirect('/test/wallets')

			});

			return;
		}

		res.redirect('/test/wallets')
	},

	change_settings : function (req, res) {
		
		if(req.method === 'POST') {
			

			var data = {
				fund : parseFloat(req.param('fund')),
				withdrawal : parseFloat(req.param('withdrawal')),
				allow_fund : req.param('allow_fund') === 'on',
				allow_withdrawal : req.param('allow_withdrawal') === 'on',
			}

			var code = req.param('code');

			WalletService.settings(code, data);
			WalletService.save_settings(function (err, data) {
				res.redirect('/test/wallets');
			});

			return;

		}

		res.redirect('/test/wallets')	
	},

	wallets : function (req, res) {
		var locals = _.defaults(req.params.all(), { currencie : 'doge', user : 'User1', error : null, balance : 0, history : [] });

		var wallet = WalletService[locals.currencie + 'coin'];

		locals.settings = WalletService.settings(wallet.code);
		locals.code = wallet.code;


		async.series({
			address : function (cb) {
				
				if(req.method === 'POST' && req.param('op') === 'new_adress') 
					return wallet.createAddress(locals.user, cb);			

				wallet.getAddress(locals.user, cb);
			},
			history : function (cb) {
				Orders
					.find({ user : locals.user, cur : wallet.code })
					.sort('createdAt DESC')
					.limit(30)
					.exec(cb)
			},
			balance : function (cb) {
				wallet.balance(locals.user, cb)
			}
		}, 
			function(err, data){
				//console.log(err);

				locals = _.merge(locals, data);
				locals.error = err;

				res.view(locals);		
		});

		
	}
};

