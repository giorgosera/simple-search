var Promise = require("bluebird"),
	cheerio = require("cheerio"),
	natural = require('natural'),
	logger = require('./logger');

function Indexer(options){
	options = options || {};
	this.docIndex = options.docIndex;
	this.tokenizer = options.tokenizer || new natural.WordTokenizer();
	this.stemmer = options.stemmer || natural.PorterStemmer;
	this.stemmer.attach();
}

Indexer.prototype.index = function(id, body){
	return new Promise(function (resolve, reject) {
		this.getTerms(body).bind(this)
		.then(function(terms){
			return this.docIndex.add(id, terms);
		}).then(function(result){
			logger.info('Indexed document ' + id);
			resolve(result);
		}).catch(function(err){
			reject(err);
		});
	}.bind(this));
};

Indexer.prototype.getTerms = function(body){
	return new Promise(function (resolve, reject) {
		var $ = cheerio.load(body),
			htmlText = $.root().text();
		try{
			var terms = htmlText.tokenizeAndStem();
			resolve(terms);
		} catch(err){
			reject(new Error('Error while parsing document for terms: ' + err.message));
		}
	}.bind(this));
};

exports.createIndexer = function(options){
	return new Promise(function (resolve, reject) {
		var indexer = new Indexer(options);
		resolve(indexer);
	});
};
