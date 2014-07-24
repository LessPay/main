/**
 * FundController
 *
 * @description :: Server-side logic for managing funds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */





module.exports = {
	
	verify : function (req, res) {
		

		AccountService.verifyPayment(req.params.all(), function (err) {
			if(err) return res.serverError(err);
			res.json({ success : 1 });
		});
	},

	/**
	 * `FundController.send()`
	 */
	send: function (req, res) {
		
		/*
			Аккаунты

			Проверка принадлежности аккаунта пользователю


			Получатель

			Поиск получателя по методу (email, jabber, icq, customer_id)
			Если получатель не найден, создается аккаунт



			Баланс

			Проверка баланса пользователя 


		*/

		


		var payment = req.params.all();

		payment.amount = Utilites.getAmount(req);


		
		delete payment.mantissa;

		console.log(req.user.id, payment.account);


		AccountService.verifyPayment(payment, function (err, payment) {
			if(err) return res.serverError(err);

			AccountService.send(
				req.user.id, 
				payment.account, 
				payment.amount ,
				payment.to_type ,
				payment.to_address,
				payment.comment,
				function (err, result) {
					if(err) return res.serverError(err);
					res.json(result);
				}
			);
		});

		
	},
};

