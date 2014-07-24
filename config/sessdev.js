module.exports.session = {

	secret: '412c4c6ce83372272920049f24770a97',
	//key: 'less.sid',

	// Set the session cookie expire time
	// The maxAge is set by milliseconds, the example below is for 24 hours
	//
	// cookie: {
	//   maxAge: 24 * 60 * 60 * 1000  
	// }
	

	
	adapter: 'redis',
	host: 'localhost',
	port: 6379,
	prefix: 'lesspay:'
	
	/*
	adapter: 'mongo',
	host: 'localhost',
	port: 27017,
	db: 'anbit_test',
	collection: 'sessions',
	*/
}