var Promise = require("bluebird"),
	cheerio = require("cheerio");
	natural = require('natural');

function Indexer(options){
	options = options || {};
	this.tokenizer = options.tokenizer || new natural.WordTokenizer();
	this.stemmer = options.stemmer || natural.PorterStemmer;
	this.stemmer.attach();
}

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

var indexer = new Indexer();

exports.index = function(url, body){
	return new Promise(function (resolve, reject) {
		indexer.getTerms(body)
		.then(function(terms){
			console.log(terms);
			resolve(terms);
		}).catch(function(err){
			reject(err);
		});
	});

};