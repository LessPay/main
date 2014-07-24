module.exports = function (req, res, next) {

	PassportService.initialize()(req, res, function () {

		PassportService.session()(req, res, function () {

			res.locals.user = req.user;
			next();
		});

	});

};