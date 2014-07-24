/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index : function (req, res, next) {
        if(!req.user) return next();

        Templates
            .find({ owner : req.user.id })
            .exec(function (err, templates) {
               if(err) return res.serverError(err);
               
               res.json(templates) ;
            });
    },

    
    create : function (req, res, next) {
        if(!req.user) return next();


        var order = req.params.all(),
        template_name = req.param('template_name');


        AccountService.verifyPayment(order, function (err, verified) {
            console.log(err, verified);

           if(err) return res.serverError(err);


           Templates.create({
                owner : req.user.id,
                order : order,
                name : template_name
           })

           .exec(function (err, result) {
               if(err) return res.serverError(err, result);

               res.send(result);      

           });
        

        });
    }
};

