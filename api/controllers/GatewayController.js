/**
 * GatewayController
 *
 * @description :: Server-side logic for managing gateways
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	


	/**
	 * `GatewayController.pay()`
	 */
	pay: function (req, res) {
		return res.view({
			layout: "gateway/layout.ejs" 
		});
	},


	/**
	 * `GatewayController.index()`
	 */
	index: function (req, res) {
		return res.view({
			layout: "gateway/layout.ejs" 
		});
	}
};

