
var async = require('async');
var shift = 100000000;

/*var hashids = new Hashids("this is my salt"),
    hash = hashids.encrypt(1, 1),
    numbers = hashids.decrypt(hash);
*/



var voucherManger = {
    settings : {
        expired : 2
    },   

    get : function  (voucher_id, user_id, done) {
        var me = this;

        Voucher
            .findOne({ 'id' : voucher_id, 'or' : [ {'owner' : user_id}, {'usedBy' : user_id} ] })
            .populate('order')
        .exec(function (err, voucher) {
            if(err) return done(err, null);
            if(!voucher) return done('Voucher is not owned by this user.', err);

            done(null, me.prepareVoucher(voucher));            
        });
    },


    activate : function  (voucher_id, user_id, done) {
        var me = this;

        Voucher
            .findOne(voucher_id)
            .populate('order')
        .exec(function (err, voucher) {
            if(err) return done(err, null);
            if(!voucher) return done('Voucher does not exist.', null);
            if(voucher.usedBy) return done('Voucher already used.', null);

            // console.log(voucher);

            async.auto({
                transaction : function (cb) {
                    Transaction.findOne(voucher.transaction).exec(cb);
                },

                account : ['transaction', function (cb, data) {
                    AccountService.getAccountByCode(user_id, data.transaction.code, cb)
                }],

                // change_transaction : ['account', function (cb, data) {
                //     data.transaction.to_user = user_id;
                //     data.transaction.to_account = data.account.id;
                //     data.transaction.save(cb);
                // }],

                transaction_to : ['account', function (cb, data) {
                       Transaction.create({
                            amount : data.transaction.amount,
                            fee : data.transaction.fee,
                            code: data.account.code,
                            to_user: data.account.owner,
                            to_account: data.account.id,
                            type: 'voucher',
                            transit_data : { address_type : 'voucher',  address : voucher.id }

                        }).exec(cb);     
                }],

                order : ['transaction_to', function (cb, data) {
                    Orders.create({
                        transaction: data.transaction.id,
                        amount: data.transaction.amount,
                        code: data.account.code,
                        fee: data.transaction.fee,
                        owner : data.account.owner,
                        account : data.account.id,
                        type : 'credit',
                        address_type : 'voucher',
                        address : voucher.id,
                        

                    }).exec(cb);  
                }]
           

            }, function (err, data) {
                if(err) return done(err, null);

                voucher.usedBy = user_id;
                voucher.save(function (err, voucher) {
                    if(err) return done(err, null);

                    done(null, me.prepareVoucher(voucher));
                })

            })
            
        });



    },


    prepareVoucher : function (voucher) {
        var expired = new Date(voucher.createdAt);
        expired.setDate(expired.getDate() - 2);

        var currentDate = new Date();

        var data = {
            id : voucher.id,
            amount : voucher.order.amount / shift,
            code : voucher.order.code,
            link : "/voucher/" + voucher.prefix + "/" + voucher.link
            
        };


        if(voucher.usedBy) {
            data['activation'] = voucher.updatedAt;
            // data['status'] =  voucher.owner === voucher.usedBy ? "r" : "a";
            data['status'] =  'a';
        } 

        else data['expiration'] = expired;


        
        return data;
    

    },

    list : function (user_id, done) {
        var me = this;

        Voucher
            .find({ 'or' : [ {'owner' : user_id}, {'usedBy' : user_id} ] })
            .sort('createdAt desc')
            .populate('order')
        .exec(function (err, vouchers) {
            if(err) return done(err, null);
            vouchers = _.map(vouchers, me.prepareVoucher);
            done(null, vouchers);            
        })
    },

    find : function () {
        
    },


    send : function (user, voucher_id, method, address, done) {

        var me = this;

        console.log(arguments);
        
        Voucher.findOne({ 'owner' : user, 'id' : voucher_id}).populate('order')
            .exec(function (err, voucher) {
                if(err) return done(err, null);
                if(!voucher) return done('Voucher does not exist', null);
                if(voucher.usedBy) return done('Voucher already used.', null);

                voucher_data = me.prepareVoucher(voucher);

                var locals = {
                    'sbuject' : 'LessPay transfer',
                    'text' : "You got a voucher for a " + voucher_data.amount + " " + voucher_data.code 
                        + ".\n To obtain a voucher click here. http://www.doctorsearch.ru/" + voucher_data.link,
                    'to' : address
                };

                if(method === 'mail') {
                    locals.template = 'send_voucher'
                }

                MessageService.send(method, locals, function (err, result) {
                    done(null, voucher_data);
                });



                
            });


    },

    create : function (user, account, amount, comment, done) {

        var fee = 0;
        var shift = 100000000;

        fee = fee * shift;
        amount = amount * shift;

        async.auto({
            account : function (cb) {
                AccountService.getAccount(user, account, cb); 
            },

            transaction : ['account', function (cb, data) {
                   Transaction.create({
                        amount : amount,
                        fee : fee,
                        code: data.account.code,
                        from_user: data.account.owner,
                        from_account: data.account.id,
                        type: 'voucher'                   
                    }).exec(cb);     
            }],

            order : ['transaction', function (cb, data) {
                   Orders.create({
                        transaction: data.transaction.id,
                        amount: amount,
                        code: data.account.code,
                        fee: fee,
                        owner : data.account.owner,
                        account : data.account.id,
                        type : 'debet',
                        address_type : 'voucher',
                        // address : to.id,
                        // comment : comment
                    }).exec(cb);     
            }],

            voucher : ['order', function (cb, data) {
                
                Voucher.create({
                    owner : data.account.owner,
                    transaction : data.transaction.id,
                    order : data.order.id 
                }).exec(function  (err, voucher) {

                    async.series([
                        function (cb) {
                            
                            data.transaction.transit_data = {
                                address_type : 'voucher',
                                address : voucher.id
                            }
                            data.transaction.save(cb);
                        },

                        function (cb) {
                            data.order.address = voucher.id;
                            data.order.save(cb);
                        }
                    ], function (err, data) {
                        cb(err, voucher);
                    }) 
                });

            }],
        }, function (err, data) {
            if(err) return done(err, null);

            done(err, data.voucher);
        });
    },

    reject : function (voucher_id, user_id, done) {
        var me = this;
        me.activate(voucher_id, user_id, done)
    }

}


setInterval(function () {
    if (typeof Voucher === 'undefined') return;
    
    var expired = new Date();
        expired.setDate(expired.getDate() - voucherManger.settings.expired);



    Voucher.find({
        'usedBy' : {
            '$exists' : false
        },
        'createdAt' : { 
            '$lte': expired
        }        
    }).exec(function (err, vouchers) {

        async.map(vouchers, function (voucher, done) {
            voucherManger.reject(voucher.id, voucher.owner, done);
        }, function (err, result) {
            
        });
    });
},  10000);


module.exports = voucherManger;