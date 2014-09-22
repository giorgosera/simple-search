var searchEngine = require('./lib/main'),
	mongodb = require('./db/mongodb'),
	index = require('./lib/index'),
	logger = require('./lib/logger');

/*
You can modify this module to inject another 
implementation of an index and an indexer
*/

mongodb.getDocIndex().then(function(docIndex){
	return index.createIndexer({
		docIndex: docIndex
	});
}).then(function(indexer){
	searchEngine.start(indexer);
}).catch(function(err){
	logger.error("Failed to initialize search engine server: " + err.message + "\n" + err.stack);
	process.exit(1);
});