var searchEngine = require('./lib/main'),
	mongodb = require('./db/mongodb'),
	indexer = require('./lib/indexer'),
	logger = require('./lib/logger');

mongodb.getDocIndex().then(function(docIndex){
	return searchEngine.setIndex(docIndex);
}).then(function(indexer){
	return searchEngine.setIndexer(indexer);
}).then(function(){
	return searchEngine.start();
}).catch(function(err){
	logger.error("Failed to initialize search engine server: " + err.message + "\n" + err.stack);
	process.exit(1);
});