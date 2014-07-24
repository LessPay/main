/**
 * OrdersController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    getfundaddress : function (req, res, next) {
        if(!req.user) return res.notFound(); 

        var account_id = req.param('account_id');
        if(!account_id) return res.notFound(); 

        Accounts.findOne({
            id : account_id,
            owner : req.user.id
        }).exec(function (err, account) {
            if(!account) 
                return res.serverError(
                    res.i18n('Account does not exist')
                );

            var wallet = WalletService.code(account.code);

            if(!wallet) 
                return res.serverError(
                    res.i18n('Wallet does not exist')
                );

            wallet.createAddress(account.id, function (err, address) {
                account.fund = address;

                sails.sockets.broadcast(req.user.id, 'account:changed',  account); 

                return res.json(account);
            })

        })


    },

	index : function (req, res) {
        if(!req.user) return res.notFound();

        var account_id = req.param('account_id');

        if(account_id) {
            AccountService.getAccount(req.user, account_id, function (err, accounts) {           
                if(err) return res.serverError(err);

                //TODO If error log and send message (user, data, method, user_ip, methodName, controllerName);
                res.json(accounts);
            });

            return
        }  
               

        AccountService.getAccounts(req.user, function (err, accounts) {           
            if(err) return res.serverError(err);
            //TODO If error log and send message (user, data, method, user_ip, methodName, controllerName);
            res.json(accounts);
        });
    },
};

