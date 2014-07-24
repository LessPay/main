/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index : function (req, res) {			
        User.find({}).exec(function (err, users) {
            if(err) return res.serverError(err);

            res.json(users);
        })
	}
};

