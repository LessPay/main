var Class = require('jsclass/src/core').Class;
var Observable = require('jsclass/src/observable').Observable;

var revalidator = require('revalidator');
var _ = require('lodash');
var async = require('async');

var shift = 100000000;


revalidator.validate.messages = {
    required:             "FIELD_REQUIRED",
    allowEmpty:           "FIELD_CANT_BE_EMPTY",
    minLength:            "is too short (minimum is %{expected} characters)",
    maxLength:            "is too long (maximum is %{expected} characters)",
    pattern:              "invalid input",
    minimum:              "must be greater than or equal to %{expected}",
    maximum:              "must be less than or equal to %{expected}",
    exclusiveMinimum:     "must be greater than %{expected}",
    exclusiveMaximum:     "must be less than %{expected}",
    divisibleBy:          "must be divisible by %{expected}",
    minItems:             "must contain more than %{expected} items",
    maxItems:             "must contain less than %{expected} items",
    uniqueItems:          "must hold a unique set of values",
    format:               "is not a valid %{expected}",
    conform:              "must conform to given constraint",
    type:                 "must be of %{expected} type",
    additionalProperties: "must not exist"
}


// Math.logb = function(number, base) {
//     return Math.log(number) / Math.log(base);
// };

//parseInt(Math.logb(9, 10))


//messages
var paymentSchema = {
    amount : {
        type : 'integer',
        required: true,
        allowEmpty: false,
        exclusiveMinimum: 0
    },


    // url: {
    //     description: 'the url the object should be stored at',
    //     type: 'string',
    //     pattern: '^/[^#%&*{}\\:<>?\/+]+$',
    //     required: true
    // },
    // challenge: {
    //     description: 'a means of protecting data (insufficient for production, used as example)',
    //     type: 'string',
    //     minLength: 5
    // },
    // body: {
    //     description: 'what to store at the url',
    //     type: 'any',
    //     default: null
    // }
};


var default_accounts = [{
        name : 'ANI Account',
        currency_name : 'animecoin',
        shortCode: 'ANI',
        code : 'ANI',
        isDefault: true
    }, {
        name : 'BTC Account',
        currency_name : 'BTC',
        shortCode: 'BTC',
        code : 'BTC',
        isDefault: true
    }, {
        name : 'LTC Account',
        currency_name : 'litecoin',
        shortCode: 'LTC',
        code : 'LTC',
        isDefault: true
    }, {
        name : 'DOGE Account',
        currency_name : 'dogecoin',
        shortCode: 'DOGE',
        code : 'DOGE',
        isDefault: true
    }, {
        name : 'LP USD Account',
        currency_name : 'LessPay USD',
        shortCode: 'LP USD',
        code : 'LP',
        isDefault: true
    }];


var default_codes = _.map(default_accounts, function (account) {
    return account.code;
});


var accounts_index = _.groupBy(default_accounts, function (account) {
    return account.code;
});




var AccountManager = new Class({
    initialize : function () {
        var me = this;
    },


    updateUserBalance : function (user, account, done) {
        if(!user || !account) return done ? done(null, null) : null;
        var me = this;

        // console.log(user, account);

        me.getBalance(user, function (err, balance) {
            if(err && done) return done(err);
            // TODO LOG ERROR
            balance = balance[account];     

            //console.log('Send to account', user, account);

            sails.sockets.broadcast(user, 'transaction_complete',  {
                'account' : account,
                'balance' : (balance[0].result / shift)
            }); 

            if(done) done(err, balance);
        });

    },

    transaction_info : function (user_from, account_from, to_address_type, to_address, done) {
        var me = this;
        // console.log('Transaction info', user_from, account_from);
        

        async.auto({
            from : function (cb) {
               me.getAccount(user_from, account_from, cb); 
            }, 

            to : ['from', function (cb, data) {                            
                UserService.getByAddress(to_address_type, to_address, function (err, user) {
                    if(err || !user) return cb(err, null);    
                    me.getAccountByCode(user.id, data.from.code, cb);
                });     
            }]      

        }, done);
            
    },


    send : function (user_from, account_from, amount, to_address_type, to_address, comment, done ) {
        var me = this;
        var fee = 0;
        var shift = 100000000;

        fee = fee * shift;
        amount = amount * shift;

        me.transaction_info(user_from, account_from, to_address_type, to_address, function (err, data) {
            if(err) return done(err);

            var from = data.from.toObject()
            , to = data.to.toObject();

            if(user_from !== from.owner || account_from !== from.id)
                return done('Proposed account of the sender and the sender\'s account was found not match');


            async.auto({
                transaction : function (cb) {
                    Transaction.create({
                        amount : amount,
                        fee : fee,
                        code: from.code,
                        from_user: from.owner,
                        from_account: from.id,
                        to_user: to.owner,
                        to_account: to.id,
                        type: 'account',
                        transit_data : {
                            comment : comment,
                            address_type : to_address_type,
                            address : to_address
                        },
                        comment : comment
                    
                    }).exec(cb);
                },

                debit : ['transaction', function (cb, data) {
                
                    Orders.create({
                        transaction: data.transaction.id,
                        amount: amount,
                        code: from.code,
                        fee: fee,
                        owner : from.owner,
                        account : from.id,
                        type : 'debet',
                        address_type : 'account',
                        address : to.id
                    }).exec(cb);

                }],
                
                credit : ['transaction', function (cb, data) {
                    Orders.create({
                        transaction: data.transaction.id,
                        amount: amount,
                        code: to.code,
                        fee: fee,
                        owner : to.owner,
                        account : to.id,
                        type : 'credit',
                        address_type : 'account',
                        address : from.id
                    }).exec(cb);
                }]


            }, function (err, data) {
                if(err) return done(err); 
                done(null, { success : 1 });
            });

        });

                
    },

    fund : function () {
        
    },

    withdrawal : function () {
        
    

    },



    verifyPayment : function (payment, done) {

        /*
            Check all variables (ammount - int, mantissa - int,)
            Get account
            Get account balance and compare it with amount
            Check minmal amount
            Check maximal amount

        */

        // console.log(payment);


        return done(null, payment);

        payment.amount = parseInt(payment.amount);
        payment.mantissa = parseInt(payment.mantissa) || 0;

        // paymentSchema.mantissa.maximum = 100 Check For LP (mantissa length set in settings)



        var checked = revalidator.validate(payment, {
            properties: paymentSchema  
        });

        var errors = checked.valid ? null : _.groupBy(checked.errors, function(item) { return item.property; });

        done(errors, payment);  
    },


    getAccountByCode : function (user, code, done) {
        var me = this;

        me.getAccounts(user, function (err, accounts) {
            if(err) return done(err, null);

            var index = _.findIndex(accounts, { code : code, isDefault : true });  
            if(index < 0) return done('Account does not exist.', null);

            done(null, accounts[index]);
        });
    },

    getAccount : function (user, account_id, done) {
        var me = this;
        if(_.isObject(user)) user = user.id;


        me.getAccounts(user, function (err, accounts) {
            if(err) return done(err, null);
            
            var account = _.filter(accounts, { 'isDefault' : true, 'id' : account_id });
            if(!account.length) return done('Account is not owned by the user.', null);

            done(null, account[0]);
        });
    },


    makeDefaults : function (user, done) {
        var me = this;        
        if(_.isObject(user)) user = user.id;

        async.auto({
            stored : function (cb) { 
                Accounts
                    .find({ owner : user })
                    .sort('code asc')
                    .exec(cb); 
            },
            created : ['stored', function (cb, data) {      

                var stored_codes = _.chain(data.stored).filter({ 'isDefault' : true }).map('code').value();

                var missed_accounts = _.chain(default_codes).difference(stored_codes)
                    .map(function (code) {
                        var tmp = accounts_index[code][0];

                        return {
                            name : tmp.name,
                            currency_name : tmp.currency_name,
                            code : code,
                            isDefault: true,
                            owner : user
                        }
                    }).value();

                return  missed_accounts.length 
                    ? Accounts.create(missed_accounts).exec(cb) 
                    : cb(null, null);

                //TODO проверка на количество созданных по умолчанию аккаунтов   
                //TODO error log if accounts less than default_accounts_length
            }]

        }, function (err, data) {
            if(err) return done(err, null);

            var stored = data.stored || [], created = data.created || [];
            done(null, stored.concat(created));
        }); 
    },

    getAccounts : function (user, done) {
        var me = this;        
        if(_.isObject(user)) user = user.id;

        me.makeDefaults(user, function (err, accounts) {         

            me.getBalance(user, function (err, result) {
                if(err) return done(err);


                

                accounts = _.map(accounts, function (account) {

                    account.balance = 
                        account.id in result ? result[account.id][0].result / shift : 0

                    return _.extend(account, accounts_index[account.code][0] ) 
                });


                WalletService.getAddress(accounts, function (err, accounts) {  
                    if(err) return done(err, null);


                    done(err, accounts.length ? accounts : null );
                });    
                
            });     

        });       
    },

    getBalance : function (user, done) {
        if(_.isObject(user)) user = user.id;


        Orders.native(function (err, collection) {
            collection.collection('orders').aggregate([
                { '$match'   : { 'owner' : user } },
                { '$project' : {
                        amount : 1, fee : 1, code : 1, account : 1, type : 1,                        
                        total : {
                            '$cond': [
                                {'$eq': [ "$type", "debet" ]}, 

                                { '$subtract' : [
                                    0, { '$subtract' : ['$amount', '$fee']} 
                                ]},

                                { '$subtract' : ['$amount', '$fee']},
                            ]         
                        },                    
                        // total : { '$subtract' : ['$fake_amount', '$fee']}
                }},
                
                { '$group' :  {                                 
                    '_id': "$account", 
                    'result': {$sum: "$total"}   
                    }                        
                },
            
            ], function  (err, results) {
                if(err) return done(err, null);
                results = _.groupBy(results, '_id');
                done(err, results);
            });             
        })
    },

    getAccountBalance : function (account, done) {
        var me  =this;

        if(_.isObject(account)) account = account.id;

        me.getBalance(function (err, accounts) {
            if(err) return done(err);
            done(null, accounts[account]);
        });
    }

});


var manager = new AccountManager();
module.exports = manager;
