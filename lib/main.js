var express = require('express'),
	app = express(),
	Promise = require('bluebird'),
	Indexer = require('./indexer'),
	Cache = require('./linkedHashMap'),
	logger = require('./logger'),
	md5 = require('MD5'),
	bodyParser = require('body-parser');

	
    var cache = new Cache(1000);  //creating the cache with size 1000
    
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
        app.get('indexer').getTerms(query).then(function(queryTerms){
            var hashKey = md5(queryTerms);   //hash query to use as key, produced by queryterms
        }).then(function(hashKey){
            if(cache.get(hashKey)){      //cache lookup
                console.log('accessing cache');
                //TODO return results
            }
            else{
                app.get('indexer').getTerms(query).then(function(queryTerms){
                    return app.get('db').retrieve(indexName, queryTerms);
                }).then(function(docs){
                    res.json({
                        query: query,
                        totalResults: docs.length,
                        results: docs
                    });
                    //cache.addItem(hashKey,"eimai mesa");    //and insert most recent hashkey and result in cache
                });
            }
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



