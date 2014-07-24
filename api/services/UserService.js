var Class = require('jsclass/src/core').Class;
var Observable = require('jsclass/src/observable').Observable;

var users = {}, sessions = {};


var UserManager = new Class({ 
    users : users,
    add : function (uid, socket) {
        if(socket && !_.isString(socket) ) socket = sails.sockets.id(socket);

        if(!(uid in users)) return (users[uid] = [socket]);
        if(users[uid].indexOf(socket) >= 0) return;
        users[uid].push(socket);
        return users[uid];      
    },

    remove : function (uid, socket) {
        if(!(uid in users)) return;     
        if(users[uid].length === 1) return (delete users[uid]) ;

        var index = users[uid].indexOf(socket);
        

        if(index < 0) return;

        users[uid].splice(index, 1);
        return users[uid];
        
    },

    send : function (uid, data, type) {
        var type = type || 'message';
        sails.sockets.emit(this.users[uid], type, data);
    },


    invite : function (argument) {


    },

    getByAddress : function (address_type, address, done) {

        if(address_type === 'customer_id' || address_type === 'account') 
            return User.findOne({ customer_id : address}).exec(done);


        if(address_type === 'email') 
            return User.findOne({ email : address}).exec(done);


        Contact
            .findOne({ contact_type : address_type, value: address })
            .exec(function  (err, contact) {
                if(err || !contact) return done(err, contact);
                User.findOne(contact.owner).exec(done);
            })
    },

    create : function (done) {
        
    },

    tempPasswordNotify : function (user, done) {
        
    }
});

var manager = new UserManager();

module.exports = manager;