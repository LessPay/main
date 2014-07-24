/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index : function (req, res) {		
        if(!req.user)	 return res.serverNotFound();

        
		res.view({ layout : 'admin/layout'});
	}
};

