/**
 * GatewayController
 *
 * @description :: Server-side logic for managing gateways
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    /**
     * `GatewayController.index()`
     */
    index: function (req, res, next) {
        if(!req.user) return next();

        sails.sockets.join(req.socket, req.user.id);
        // console.log(sails.sockets.rooms());
        res.json({ message: 'Subscribed' });       

    },
    rooms : function (req, res) {
        res.send(sails.sockets.rooms());
    }
};

