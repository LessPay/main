/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */


module.exports = {

	_config: {}
	/*, index : function (req, res, next) {
		if(!req.session.passport.user) return res.redirect('/'); //TODO перенести в полицию
		res.view();
	}
	, register : function (req, res) {
		res.view();
	}*/

};






/*
module.exports.blueprints = {

	// Expose a route for every method,
	// e.g.
	// `/auth/foo` => `foo: function (req, res) {}`
	actions: true,

	// Expose a RESTful API, e.g.
	// `post /auth` => `create: function (req, res) {}`
	rest: true,

	// Expose simple CRUD shortcuts, e.g.
	// `/auth/create` => `create: function (req, res) {}`
	// (useful for prototyping)
	shortcuts: true

};*/
