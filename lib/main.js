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
        var hashKey = md5(query);
        var cacheResult = cache.get(hashKey);
        if(cacheResult){        //if we have a hit,
            res.json({          //our results are drawn from cache
                query: query,
                totalResults: cacheResult.value.length,
                results: cacheResult.value
            });
            var result = cache.addItem(hashKey,cacheResult.value);    //adding query and result as our most recent hit
            if(!result){
                console.log("Error: Null values for insertion");   //or instead we add it to the response with error code 500
            }
        }
        else{   //accessing db
            app.get('indexer').getTerms(query).then(function(queryTerms){
                return app.get('db').retrieve(indexName, queryTerms);
            }).then(function(docs){
                res.json({
                    query: query,
                    totalResults: docs.length,
                    results: docs
                });
                var result = cache.addItem(hashKey,docs);    //adding query and result as our most recent hit
                if(!result){
                    console.log("Error: Null values for insertion");
//                     res.status(500).json({
//                         status: "error",
//                         message: "Bad request. Null values for insertion"
//                     });
                }
            });
        }
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



