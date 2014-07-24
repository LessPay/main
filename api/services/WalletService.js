'use strict';


var bitcoin = require('bitcoin')
, _ = require('lodash')
, path = require('path')
, async = require('async');

var Class = require('jsclass/src/core').Class;
var Observable = require('jsclass/src/observable').Observable;




var fs = require('fs');


var cache_manager = require('cache-manager');

var redis_store = require('redis_store');
var redis_cache = cache_manager.caching({store: redis_store, db: 0, ttl: 60 * 60 });

var settings = {
	
	bitcoin : { 
		port: 9335, 
		user: 'TESTUSER', 
		pass: '1234321',
		code : 'BTC'
	},

	litecoin : { 
		port: 9332, 
		user: 'TESTUSER', 
		pass: '1234321',
		code : 'LTC'
	},

	animecoin : { 
		port: 9336, 
		user: 'TESTUSER',	
		pass: '1234321', 
		code : 'ANI'
	},

	dogecoin : { 
		port: 9334, 
		user: 'TESTUSER', 
		pass: 'AZfB1wM6YFTSSrJQYTqD6oPByE6PGMcKWQBr2TAEyzhg',
		code: 'DOGE'
	},
};

var chokidar = require('chokidar');

function setWatcher (path) {
	return chokidar.watch(path, {persistent: true});
}





var CryptoWalletManager = new Class({
		initialize: function(settings) {
			var me = this;
			_.each(settings, function (settings, currency) {
				me[currency] = new CryptoWallet(currency, settings);
			});

			this.config_path = path.join(__dirname, '../../wallets.json');

			this.default_settings = {
				BTC : {
					fund : 0,
					withdrawal : 0,
					allow_fund : true,
					allow_withdrawal : true
				},

				LTC : {
					fund : 0,
					withdrawal : 0,
					allow_fund : true,
					allow_withdrawal : true
				},

				ANI : {
					fund : 0,
					withdrawal : 0,
					allow_fund : true,
					allow_withdrawal : true
				},

				DOGE : {
					fund : 0,
					withdrawal : 0,
					allow_fund : true,
					allow_withdrawal : true
				},

				LP : {
					fund : 0,
					withdrawal : 0,
					allow_fund : true,
					allow_withdrawal : true,
					mantissa_length : 100
				},
			}

			me.watcher = setWatcher(me.config_path);


			me.load_settings(function (err, data) {
				if(err) me.save_settings(function (err, data) { });
			});

			me.reload = true;
			
			me.watcher.on('change', function () {
				me.settingsReload.apply(me, arguments);
			});
			
		},

		getAddress : function (accounts, done) {
				var me = this;
				
				async.map(accounts, function  (account, cb) {	

					var wacc = me.code(account.code);
					if(!wacc) return cb(null, account);

					wacc.cGetAddress(account.id, function (err, fund_address) {
						account.fund = fund_address;
						cb(err, account);
					});
				}, done);
		},

		settingsReload : function (path, stats) {
			var me = this;

			//console.log(me.reload);

			if(me.reload) {
				console.log('Config ', path, ' reloaded.');
				me.load_settings(function (err, data) { 
					//LOG ACTION
				});
			}
		},

		code : function (code) {
			var codes = {
				BTC : this.bitcoin,
				LTC : this.litecoin,
				DOGE : this.dogecoin,
				ANI : this.animecoin,
			}

			

			return codes[code];
		},

		settings : function (code, settings) {
			var me = this;

			if(settings) {
				this.default_settings[code] = _.merge(this.default_settings[code], settings);
			}

			return this.default_settings[code];
		},

		save_settings : function (done) {
			var me = this;
			var settings = JSON.stringify(this.default_settings, null, 4);
			
			me.reload = false;

			fs.writeFile(me.config_path, settings, function () {

				setTimeout(function  () {
					me.reload = true;	
				}, 50);
				
				done.apply(me, arguments);
			});
		},

		load_settings : function (done) {
			var me = this;

			fs.readFile(me.config_path, function (err, data) {
				if(err) return done(err, null);

				try {
					settings = JSON.parse(data);
					me.default_settings =  _.merge(me.default_settings, settings);
					return done(err, settings);
				} catch(err) {

					return done(err, null);
				}
			});
			
		}
});



var test_user_data = {
	'User1' : [
		{ 'amount' : 5 }
	]
}


if(!Wallet) {
	var WalletClass = new Class({
		initialize : function  () {
			
		},

		order : function (uid, amount, description) {
			// body...
		},

		balance : function (uid) {
			
		}
		
	});

	var Wallet = new WalletClass();
}


var CryptoWallet = new Class({
		include: [Observable],

		initialize: function(currency, settings) {
			this.currency = currency;
			this.code = settings.code;

			this.cmdman = new bitcoin.Client(settings);

			this.main_wallet = 'MAIN';
			this.unused_wallet = 'UNUSED';


			this.check_time

		},

		check : function  (done) {
				
		},

		send : function (user, toaddress, amount, done) {
			var me = this;

			Orders.create({
				user : user,
				address : toaddress,
				cur : me.code,
				amount : parseFloat(amount)
			})
			.exec(function (err, data) {
				console.log(err, data);
				if(err) return done(err, null);

				me.cmd('sendfrom', 'MAIN', toaddress, parseFloat(amount), function (err, data) {		
					//console.log(err, data);

					if(done) done.apply(me, arguments);
				});		


			});

			

		},

		/* ?
		sendWithFee : function  (user, toaddress, amount, done) {
			
		},
		*/ 

		walletBalance : function (user, done) {
			this.cmd('getbalance', user, 6, done);
		},

		cmd : function () {
			var args = Array.prototype.slice.call(arguments);
			var done = args[args.length - 1];

			var me = this;

			if(_.isFunction(done)) {
				args[args.length - 1] = function () {
					if(arguments[0]) me.onError(arguments[0], args[1]);

					done.apply(this, arguments);
				}		
			}
			
			this.cmdman.cmd.apply(this.cmdman, args);
		},

		createAddress : function (user, done) {
			var me = this;
			/*
			Алгоритм
			1. Найти текущий адрес - кошелька пользователя в БД
			2. Проверить баланс адреса
			3. Если есть средства - перевести на виртуальный кошелек пользователя (запись в таблице ORDERS перевод коинов на основной кошелек)
			4. Переименовать адрес в UNUSED аккаунт (сделать запись в БД лог о переименовании, с указанием старого адреса)

			Проверка на ошибки

			- ОТключен кошелек




			*/

			redis_cache.del(me.currency + '_' + user, function (err) {
                if (err) { throw err; }
                console.log('Delete cache id: ', me.currency + '_' + user);
            
                async.auto({
					clear : function (cb) {
						me.clearAccount(user, cb);
					},
					address : ['clear', function (cb, data) {
						me.cmdman.cmd('getnewaddress', user, function (err, address) {
							return cb(err, address)
						});
					}]
				}, function(err, data) {				
					done(err, data.address);
				});



            });

			
		},


		/*
			TODO функция которая перемещает все адреса в UNUSED и списывает все балансы


		*/

		clearAccount : function (user, done) {
			var me  = this;


			/*
				me.balance(user, function (err, balance) { cb(err, balance); });

				//Проверить баланс аккаунта - если он не равен нулю - зачислить все средства на баланс в БД, и переенсти в главный кошелек


			*/

			async.auto({
				balance : function (cb) {
					me.walletBalance(user, function (err, balance) { 
						if(err) return (err, balance);
						cb(err, balance); 
					});
				},


				adresses: function (cb) {					
					me.cmd('getaddressesbyaccount', user, function (err, adresses) {
						if(err) return done(err, adresses);

						// if(adresses.length) return (err, adresses);

						async.each(adresses, function (address, callback) {	
							me.cmd('setaccount', address, me.unused_wallet, callback);							
						}, function (err, result) {
							cb(err, result);
						});
					});
				}
			}, 			
			done);	


		},


		getAddress : function (user, done) {
			// Производится проверка на то что адрес у аккаунта только один
			//this.cmdman.cmd('getaccountaddress', user, done);

			// Проверить что будет если user = undefined или null

			var me = this;
			

			async.auto({
				all_address : function (cb) {
					
					me.cmd('getaccountaddress', user, function (err, adresses) {
						cb(err, adresses);
					});	
				},

				address : ['all_address', function (cb, data) {
					// console.log('All address', _.isString(data.all_address),  data);

					if(_.isString(data.all_address))
						return cb(null, data.all_address);

					if(!data.all_address) 
						return me.createAddress(user, cb);

					if(data.all_address.length === 1) 
						return cb(null,  data.all_address[0] );
					
					me.clearAccount(user, function (err) {	
						me.createAddress(user, cb);
					});
					
				}]

			}, function (err, data) {
				done(err, data.address);
			})					
		},


		cGetAddress : function  (account_id, done) {
			var me = this;

			redis_cache.wrap(me.currency + '_' + account_id, function (cb) {
				console.log('Cache id: ', me.currency + '_' + account_id);

			    me.getAddress(account_id, cb);
			}, done)
		
		},


		newAddress : function (user, done) {
			return this.createAddress(user, done);							
		},

		onError : function  (err, cmd) {
			// SEND SMS IF ERROR
			console.log(err);
		}
});


var manager = new CryptoWalletManager(settings)
module.exports = manager;





// manager.animecoin.getAddress('53c8569b79e32c7f38982181', function (err, ac) {
// 	console.log(ac);
// });



// manager.bitcoin.getAddress('53c8569b79e32c7f38982181', function (err, account) {
// 	console.log(err, account);
// });

// manager.getAddress('53c8569b79e32c7f38982181', function (err, account) {
// 	console.log(err, account);


	


// 	manager.getAddress('53c8569b79e32c7f38982181', function (err, account) {
// 		console.log(err, account);

// 		manager.animecoin.createAddress('53c8569b79e32c7f38982181', function (err, account) {
// 			console.log('Delete cache anime', err, account);

// 			manager.getAddress('53c8569b79e32c7f38982181', function (err, account) {
// 				console.log('Cached', err, account);
			
// 				manager.getAddress('53c8569b79e32c7f38982181', function (err, account) {
// 				console.log(err, account);



// 				})
// 			})
// 		})

// 	})

// })




//var latest_txid = '';


//var wid = manager['dogecoin']

/*setInterval(function () {
	manager.animecoin.cmd('listsinceblock',  function (err, balance) {
		var tract = balance.transactions[0];
		if(tract.txid !== latest_txid) {
			//FIND ALL TRANSACTION AFTER LATEST AND ADD TO JOBLIST
			console.log(tract)

			latest_txid = tract.txid;
		}

	})



}, 1000);*/

/*
	TODO сверка при принятии и отсылки валюты с общим балансом в БД, так же при проверке

*/


/*
wid.cmd('listsinceblock',  function (err, balance) {
	console.log(balance.transactions);

})


wid.cmd('listaccounts', function  (err, accounts) {
	console.log(accounts);
});
*/

/*
wid.cmd('move', 'MAIN' , '', 10636.34167, function  (err, status) {
	console.log(status);
	manager.animecoin.cmd('listaccounts', function  (err, accounts) {
		console.log(accounts);
	});
});
*/

/*manager.animecoin.cmd('move', '' , 'MAIN', 9475.69355, function  (err, status) {
	console.log(status);
	manager.animecoin.cmd('listaccounts', function  (err, accounts) {
		console.log(accounts);
	});
});
*/





/*manager.animecoin.cmd('listreceivedbyaccount', function  (err, accounts) {
	console.log(accounts);
});	*/


/*setInterval(function () {
	manager.animecoin.cmd('listreceivedbyaccount', function  (err, accounts) {
		console.log(accounts);
	});	
	
	manager.dogecoin.cmd('listaccounts', function  (err, accounts) {
		console.log(accounts);
	});

}, 1000);*/


//var accounts = ['*', 'MAIN', 'MAIN_WALLET', 'UNUSED', 'User1'];

/*
manager.animecoin.cmd('listaccounts', function  (err, accounts) {
	console.log(accounts);
})

async.each(accounts, function  (account, done) {
	manager.animecoin.balance(account, function  (err, balance) {
		console.log("%s : %s", account, balance);
	})
})*/


/* 
manager.animecoin.createAddress('User1', function  (err, data) {
	console.log('Created address: %s', data);

	manager.animecoin.getAddress('User1', function  (err, address) {
		console.log('Current address: %s', address);
	});

});
*/

/*
manager.animecoin.balance('*', function (err, balance) {
	if (err) return console.log(err);
	console.log('Balance:', balance);


	manager.animecoin.balance('UNUSED', function (err, balance) {
		console.log('')

	});

});*/



/*
manager.animecoin.createAddress('User1', function  (err, data) {
	console.log(data);

	manager.animecoin.getAddress('User1', function  (err, address) {
		console.log('Address: ', address);
	});

});
*/


/*

manager.animecoin.send('UNUSED', 'AK6k8KZgsLjP9r5sbfDRQADbe9mnwxYe2Y', 1000, function  (err, data) {

});
*/



/*
manager.animecoin.balance('*', function (err, balance) {
	if (err) return console.log(err);
	console.log('Balance:', balance);
});


manager.animecoin.balance('MAIN', function (err, balance) {
	if (err) return console.log(err);
	console.log('Balance:', balance);
});


manager.animecoin.balance('User1', function (err, balance) {
	if (err) return console.log(err);
	console.log('User1 balance:', balance);
});




manager.animecoin.balance('MAIN', function (err, balance) {
	if (err) return console.log(err);
	console.log('MAIN balance:', balance);
});

manager.animecoin.balance('MAIN_WALLET', function (err, balance) {
	if (err) return console.log(err);
	console.log('MAIN_WALLET balance:', balance);
});



manager.animecoin.balance('*', function (err, balance) {
	if (err) return console.log(err);
	console.log('* balance:', balance);
});


*/


/*
manager.animecoin.getAddress('User1', function (err, address) {
	if (err) return console.log(err);
	console.log('OLD address:', address);
});

manager.animecoin.createAddress('User1', function (err, address) {
	if (err) return console.log(err);
	console.log('Created Address:', address);
});

manager.animecoin.getAddress('User1', function (err, address) {
	if (err) return console.log(err);
	console.log('New address:', address);
});
*/