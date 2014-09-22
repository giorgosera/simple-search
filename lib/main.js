var express = require('express'),
	app = express(),
	logger = require('./logger');

app.get('/index/:_id', function (req, res) {
	var docId = req.params._id,
		docBody = req.query._body;

	console.log(docId);
	req.app.get('indexer')
	.index(docId, docBody)
	.then(function(result){
		res.json({
			result: result
		});
	}).catch(function(err){
		res.json(500, {
			status: "error",
			message: "Failed to index doc"
		});
	});
});

exports.start = function(indexer){
	app.set('indexer', indexer);
	var server = app.listen(3000, function() {
		logger.info('Simple search server listening on port %d', server.address().port);
	});
};



