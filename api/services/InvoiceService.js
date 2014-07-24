var Class = require('jsclass/src/core').Class;



var InvoiceManager = new Class({
    initialize: function() {

    },

    create : function  (from, to, amount, code, comment, done) {
        //Check params
        /*
            
        */



        async.auto({
            to_user : function (cb) {
                User.findOne({
                    'or' : [
                        {'id' : to},
                        {'customer_id' : to},
                    ]
                }).exec(cb);
            },

            invoice : ['to_user', function (cb, data) {
                if(!data.to_user) return cb('User does not exist', null);

                Invoice.create({
                    owner : from,
                    to : data.to_user.id,
                    amount : (amount || 0).toString(), 
                    code : code,
                    comment : comment
                }).exec(cb);
            }]
        }, function (err, data) {
            if(err) return done(err, null);

            done(null, data.invoice);
        });

        
    },

    accept : function (invoice_id, done) {
        
    },

    reject : function (invoice_id, done) {
        
    },

    check : function (invoice_id, done) {
        
    },

});


module.exports = new InvoiceManager();
