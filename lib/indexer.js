var Promise = require("bluebird"),
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
		this.getTerms(body).bind(this).then(function(terms){
			return this.calculateTermWeigths(terms);
		}).then(function(weightedTerms){
			return this.docIndex.add(id, body, weightedTerms);
		}).then(function(result){
			resolve(result);
		}).catch(function(err){
			reject(err);
		});
	}.bind(this));
};

Indexer.prototype.getTerms = function(body){
	return new Promise(function (resolve, reject) {
		try{
			var terms = body.tokenizeAndStem();
			resolve(terms);
		} catch(err){
			reject(new Error('Error while parsing document for terms: ' + err.message));
		}
	}.bind(this));
};

Indexer.prototype.calculateTermWeigths = function(terms){
	return new Promise(function (resolve, reject) {
		var weightedTerms = {},
			unitWeight = 1.0/terms.length;
		for(var i = 0; i< terms.length; i++) {
			var term = terms[i];
			weightedTerms[term] = weightedTerms[term] ? weightedTerms[term]+unitWeight : unitWeight;
		}
		resolve(weightedTerms);
	}.bind(this));
};

module.exports = Indexer;