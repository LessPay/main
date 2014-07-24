var _ = require('lodash'),
async = require('async');


module.exports = {
    index : function (req, res, next) {
        if(!req.user) return res.notFound();

        var type = req.param('type') || 'all';
        
        var types = {
            'all' : 0,
            'incoming' : 1,
            'outcoming' : 2
        }

        var def_date_from = new Date();
        def_date_from = def_date_from.setDate(def_date_from.getDate() + 30);

        var date_from = req.param('date_from') || def_date_from.toString();
        date_from = date_from.replace(/['"]/gim, '');
        date_from = new Date(date_from);


        var date_to = req.param('date_to') || (new Date()).toString();
        date_to = date_to.replace(/['"]/gim, '');
        date_to = new Date(date_to);
        date_to.setHours(date_to.getHours()+ 23);


        var criteria = {
            'createdAt' : {
                '$gte' : date_from ,
                '$lte' : date_to 
            }           
        };


        var current_page = parseInt(req.param('current') || 1) -1,
        items_per_page = parseInt(req.param('items_per_page') || 10);

        current_page = Math.abs(current_page);
        items_per_page = Math.abs(items_per_page);


        var trade_type = parseInt(req.param('trade_type') || 0);

        if(trade_type < 0 || trade_type > 2)  return res.serverError('Unknown trade type');
        if(!(type in types)) return res.serverError('Unknown type');


        type = types[type];

        var filter_criteria = [
            { 'or' : [{ 'owner' : req.user.id }, { 'to' : req.user.id  }] },
            { 'owner' : req.user.id }, 
            { 'to' : req.user.id  }
        ];

        var filter_trade_type =  [
            {},
            { 'status' : true, 'transaction' : { '$exists' : true } },      
            { 'status' : false}            
        ]

        criteria = _.merge(criteria, filter_criteria[type], filter_trade_type[trade_type]);





        async.auto({
            total : function (cb) {
                Invoice
                    .count({  'or' : [  { 'owner' : req.user.id },   { 'to' : req.user.id  }   ] })
                    .exec(cb);

            },

            count : function (cb) {
                Invoice
                    .count(criteria)
                    .exec(cb)
            },
            data : function (cb) {

              Invoice
                .find(criteria)
                .populate('owner')
                .populate('to')
                .limit(items_per_page)
                .skip(items_per_page * current_page)
                .sort('createdAt desc')
                .exec(cb);

            },
        }, function (err, data) {
            //console.log(err, data);
            if(err) return res.serverError(err);

            data.data = _.map(data.data, function (item) {
                delete item.owner;
                delete item.to;

                return item;
            });

            res.json(data);
        });



        
    },

    create : function (req, res, next) {
        if(!req.user) return res.notFound();

        var invoice = {};   

        var address_type = req.param('to_type') ;

        if(!(address_type in Utilites.methods)) 
            return res.serverError('The dispatch method is not defined.');

        invoice['address_type'] = address_type;


        var code = req.param('code');
        if(!code) 
            return res.serverError('You must specify the currency of payment.');

        if(!_.contains(['BTC', 'LTC', 'ANI', 'DOGE', 'LP'], code.toUpperCase())) 
            return res.serverError('Unknown type of currency.');

        invoice['code'] = code;


        var address = req.param('to_address') ;
        if(!address) 
            return res.serverError('Address of the recipient is not specified.');

        invoice['address'] = address;

        var amount = Utilites.getAmount(req);
        if(parseFloat(amount) === 0) 
            return res.serverError('Amount must be greater than zero.');

        invoice['amount'] = amount;

        var comment = req.param('comment') || '';
        if(comment.length > 125)  
            return res.serverError('Description length should be less than 128 characters.');

        invoice['comment'] = comment;

        var def_lifetime = new Date();
        def_lifetime.setDate(def_lifetime.getDate() + 2);

        var lifetime = req.param('lifetime');
        lifetime = lifetime ? new Date(lifetime) : def_lifetime;


        var copiedDate = new Date(lifetime.getTime());
        copiedDate.setHours(copiedDate.getHours() + 23 );


        if(+copiedDate < +def_lifetime)
            return res.serverError('Expiration date cannot be less than two days.');

        invoice['lifetime'] = lifetime;


        UserService.getByAddress(invoice['address_type'], invoice['address'], function (err, user) {
            
            if(err) 
                return res.serverError(err);

            if(user) {
                Invoice.create({
                    owner : req.user.id,
                    to : user.id,
                    amount : invoice['amount'],
                    lifetime : invoice['lifetime'],
                    code : invoice['code'],
                    comment : invoice['comment'],
                    address_type : invoice['address_type'],
                    address : invoice['address']
                }).exec(function (err, invoice) {
                    if(err) return res.serverError(err);

                    //TODO Send message to payer
                    return res.json({ invoice : invoice.id });
                });  
            } else {

                req.session.invoice = invoice;

                return res.json({ confirmation : true  });     
            }     

        });       
    },

    accept : function (req, res, next) {
        if(!req.user) return res.notFound();

        res.json({});
    },

    reject : function (req, res, next) {
        if(!req.user) return res.notFound();

        res.json({});
    }



}