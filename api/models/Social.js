/**
 * Social
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
	schema:'true',
	attributes: {
		sid : 'string',
		data : 'json',
		provider : 'string',
		user : {
			model : 'user'
		}
	},
	/*, beforeCreate : function  (profile, next) {
		profile['sid'] = profile['id'];
		delete profile['id']
		next(profile);
	}*/
};
