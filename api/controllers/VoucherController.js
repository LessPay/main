_ = require('lodash');


module.exports = {

    redirect : function  (req, res, next) {

        Voucher.findOne({ prefix : req.param('prefix') || 'none', link : req.param('link') || 'none' })
        .exec(function (err, voucher) {

            if(err || !voucher) return next(err);
            if(req.user) return res.redirect('/merchant/vouchers/activate/' + voucher.id);

            req.session.voucher = voucher.id;
            req.session.save(function (err) {
                return res.redirect('/frontpage/registration/');
            });

        });
    },

    index: function  (req, res, next) {
            if(!req.user) return res.notFound();

            VoucherService.list(req.user.id, function  (err, vouchers) {
                if(err) return res.serverError(err);
                res.json(vouchers);
            });
    },


    send: function  (req, res, next) {
            if(!req.user) return res.notFound();

            VoucherService.send(req.user.id, req.param('vid') || 'none', req.param('method') || 'none', req.param('address'), 
                function  (err, vouchers) {
                    if(err) return res.serverError(err);
                    res.json(vouchers);
            });
    },




    create : function (req, res, next) {
        var params = req.params.all();


        if(!req.user || !params.from_account) return res.notFound();

        

        var amount = Utilites.getAmount(req);

        VoucherService.create(req.user.id, params.from_account.id, amount, params.comment || '', function (err, voucher) {
            if(err) return req.serverError(err);


            if(req.param('send')) 
                return VoucherService.send(
                    req.user.id, 
                    voucher.id, 
                    req.param('method') || 'none',  
                    req.param('address') || 'none',  
                    function (err, voucher) {
                        console.log(voucher);

                        res.json(voucher);
                    }
                );


            res.json(voucher);
        });
    },

    activate : function (req, res, next) {
        if(!req.user) return res.notFound();

        var voucher_id = req.param('vid');

        if(!voucher_id) 
            return res.serverError(
                res.i18n('Unknown voucher identifier')
            );

        VoucherService.activate (voucher_id, req.user.id, function (err, voucher) {
            if(err) return res.serverError(err);

            res.json(voucher);
        })        
    },

    get : function (req, res, next) {
        if(!req.user) return next();
        var voucher_id = req.param('vid');

        if(!voucher_id) 
            return res.serverError(
                res.i18n('Unknown voucher identifier')
            );

        VoucherService.get(voucher_id, req.user.id, function (err, voucher) {
            if(err) return res.serverError(err);

            res.json(voucher);
        })        
    },

    reject : function (req, res, next) {
        if(!req.user) return next();
        var voucher_id = req.param('vid');

        if(!voucher_id) 
            return res.serverError(
                res.i18n('Unknown voucher identifier')
            );

        VoucherService.reject(voucher_id, req.user.id, function (err, voucher) {
            if(err) return res.serverError(err);
            res.json(voucher);
        })        
    }


};