

module.exports = {
    getAmount : function (req) {
        var amount = (req.param('amount') || 0).toString();
        amount = amount.replace(',', '.');
        amount = parseFloat(amount);
        amount = Math.abs(amount);

        var mantissa = '0.' + (req.param('mantissa') || '0').toString();
        mantissa = parseFloat(mantissa);
        mantissa = Math.abs(mantissa);
        

        amount = amount + mantissa;
        amount = amount.toFixed(8);

        return amount;
    },

    methods : {
        'account' : 'CustomerID',
        'email' : 'Email',
        'jid' : 'JabberID',
        'icq' : 'ICQ',
        'phone' : 'SMS'
    },
}