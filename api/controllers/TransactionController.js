/**
 * TransactionController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 var _ = require('lodash');

module.exports = {
    last : function (req, res, next) {
        if(!req.user) return next();

        var user = req.user,
        qty = parseInt(req.param('qty')) || 5;


        if(qty > 30) qty = 30;
        if(qty < 5) qty = 5;

        Transaction.find({
            'or' : [
                { 'from_user' : user.id },
                { 'to_user' : user.id }
            ]
        })
        .limit(qty)
        .sort('createdAt desc')
        .exec(function function_name (err, transactions) {
            if(err) return res.serverError(err);

            transactions = _.map(transactions, function (tr) {
                if(tr.from_user === req.user.id && tr.from_user !== tr.to_user) tr.amount = -tr.amount;
                return tr;
            });


            res.json(transactions);
        });
    }
};

