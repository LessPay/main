module.exports = function(req, res, next) {
    req.setLocale('en');
    next();
};