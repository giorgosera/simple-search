var searchEngine = require('./lib/main'),
	MongoIndex = require('./db/mongodb'),
	indexer = require('./lib/indexer'),
	logger = require('./lib/logger');

new MongoIndex().then(function(docIndex){
	return searchEngine.setIndex(docIndex);
}).then(function(){
	return searchEngine.start();
}).catch(function(err){
	logger.error("Failed to initialize search engine server: " + err.message + "\n" + err.stack);
	process.exit(1);
});