/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	front : function (req, res, next) {

		if(req.user) {
			if(req.session.voucher) {
				var vid = req.session.voucher ;
				req.session.voucher = null;
				req.session.save();
				return res.redirect('/merchant/vouchers/activate/' + vid);
			}

			return res.view();
		}
			

		

		res.view('front/index', { layout : 'front/layout'});

		// if(!req.user) {
		// 	if(req.path !== '/' && req.path !== '/registration') return res.redirect('/');
		// 	return res.view('main/auth');
		// }
		

		
		// res.view();
	},

	admin : function (req, res, next) {
		res.view();
	}
};

