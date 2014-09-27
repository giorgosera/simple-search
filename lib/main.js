var express = require('express'),
	app = express(),
	Promise = require('bluebird'),
	Indexer = require('./indexer'),
	logger = require('./logger'),
	bodyParser = require('body-parser'),
    cache = require('./cache.js');

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/index/:indexName/:id', function (req, res) {
	var indexName = req.params.indexName,
		docId = req.params.id,
		docBody = req.body._body;

	if (docBody){
		req.app.get('indexer')
		.index(indexName, docId, docBody)
		.then(function(result){
			res.json({
				indexed: true,
				id: docId,
				index: indexName,
				result: result
			});
		}).catch(function(err){
			logger.error('Failed to index doc: ' + err.message + "\n" + err.stack);
			res.status(500).json({
				status: "error",
				message: "Failed to index doc: " + err.message
			});
		});
	} else {
		res.status(400).json({
			status: "error",
			message: "Bad request. Document id or body are missing"
		});
	}

});

app.get('/search/:indexName?', function (req, res) {
	var query = req.query.q,
		indexName = req.params.indexName;

	var error;
	if (!indexName){
		res.status(400).json({
			status: "error",
			message: "Bad request. Index name is missing. Try /search/<indexName>"
		});
	} else if (!query){
		res.status(400).json({
			status: "error",
			message: "Bad request. The query string is missing"
		});
	} else {

        var miss, lastQueryTerms;

		app.get('indexer').getTerms(query).then(function(queryTerms){

            var cached = cache.get(queryTerms);

            if (cached) {
                miss = false;
                console.log("cache hit");
                return cached;
            } else {
                miss = true;
                lastQueryTerms = queryTerms;
                console.log("cache miss");
                return app.get('db').retrieve(queryTerms);
            }

		}).then(function(docs){

            if (miss){
                cache.set(lastQueryTerms, docs);
            }

			res.json({
				query: query,
				totalResults: docs.length,
				results: docs
			});
		});
	}

});

exports.setDb = function(db){
	return new Promise(function (resolve, reject) {
		app.set('db', db);
		resolve();
	});
};

exports.start = function(){
	return new Promise(function (resolve, reject) {
		if (!app.get('db')){
			reject(new Error("Cannot initialize search engine without a database. Please use `setIndex(index)`."));
		}
		app.set('indexer', new Indexer({
			db: app.get('db')
		}));
		var server = app.listen(3000, function() {
			logger.info('Simple search server listening on port %d', server.address().port);
			resolve(this);
		});
	});
};



