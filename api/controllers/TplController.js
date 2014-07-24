/**
 * TplController
 *
 * @description :: Server-side logic for managing tpls
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	getTemplate : function (req, res) {
		//var template_name = req.param('template_name');
		var template_name = req.param('0');
		if(!template_name) return res.serverError('Template is not exist');


		res.view('templates/' + template_name, {
			layout: null
		});
	}
};

