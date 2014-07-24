var _ = require('lodash');

var voucher_status = ['active', 'rejected', 'activated'];

module.exports = {

    attributes: {

        link : {
            type : 'string',
        }, 
        
        prefix : {
            type : 'string',
        }, 
        
        owner : {
            type : 'string',
            required: true
        }, 

        usedBy: 'string',

        transaction : {
            type : 'string',
            required: true
        }, 

        order:{
            model: 'Orders'
        },

/*        order : {
            type : 'string',
            required: true
        },

        status : {
            type : 'boolean',
            required: true,
            defaultsTo : true
        }
*/
    },

    beforeCreate : function (voucher, done) {

        voucher.prefix = (+new Date() * Math.random()).toString(36).slice(9, 10);
        voucher.link = (+new Date()).toString(36);

        done(null, voucher);
    },

    afterCreate : function (voucher, done) {
        sails.sockets.broadcast(voucher.owner, 'voucher',  VoucherService.prepareVoucher(voucher));

        done(null, null);
    },

    afterUpdate : function (voucher, done) {
        sails.sockets.broadcast(voucher.owner, 'voucher',  VoucherService.prepareVoucher(voucher));
        done(null, null);
    }
};

