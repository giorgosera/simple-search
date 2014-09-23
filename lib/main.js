var express = require('express'),
	app = express(),
	Promise = require('bluebird'),
	indexer = require('./indexer'),
	logger = require('./logger'),
	bodyParser = require('body-parser');

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/index/:_id', function (req, res) {
	var docId = req.params._id,
		docBody = req.body._body;

	if (docBody){
		req.app.get('indexer')
		.index(docId, docBody)
		.then(function(result){
			res.json({
				indexed: true,
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

app.get('/search', function (req, res) {
	var query = req.query.q;
	app.get('indexer')
	.getTerms(query)
	.then(function(queryTerms){
		return app.get('index').retrieve(queryTerms);
	})
	.then(function(docs){
		res.json({
			query: query,
			results: docs
		});
	});
});

exports.setIndex = function(index){
	return new Promise(function (resolve, reject) {
		app.set('index', index);
		resolve();
	});
};

exports.setIndexer = function(indexer){
	return new Promise(function (resolve, reject) {
		app.set('indexer', indexer);
		resolve();
	});
};

exports.start = function(){
	return new Promise(function (resolve, reject) {
		if (!app.get('indexer')){
			indexer.createIndexer({
				docIndex: app.get('index')
			}).then(function(indexer){
				app.set('indexer', indexer);
			});
		}
		var server = app.listen(3000, function() {
			logger.info('Simple search server listening on port %d', server.address().port);
			resolve(this);
		});
	});
};



