/**
 * FrontController
 *
 * @description :: Server-side logic for managing fronts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index : function (req, res) {
		
		res.view({ layout : 'front/layout'});
	},
};

