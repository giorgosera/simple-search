var Promise = require("bluebird"),
	mongodb = Promise.promisifyAll(require('mongodb')),
	MongoClient = mongodb.MongoClient,
	Server = require('mongodb').Server;

var MongoIndex = function(){
	return new Promise(function (resolve, reject) {
		MongoClient.connectAsync("mongodb://localhost:27017/ssIndex").bind(this)
		.then(function(db){
			this.db = db;
			resolve(this);
		}).catch(function(err){
			reject(err);
		});
	}.bind(this));
};

MongoIndex.prototype.add = function(docId, body, terms) {
	return new Promise(function (resolve, reject) {
		this.db.collectionAsync('index')
		.then(function(collection) {
			collection.ensureIndexAsync("terms.term").then(function(){
				var termsList = [];
				for(var term in terms) {
					if (terms.hasOwnProperty(term)) {
						termsList.push({
							term: term,
							weight: terms[term]
						});
					}
				}
				var doc = {
					doc_id: docId,
					body: body,
					terms: termsList
				};
				collection.insertAsync(doc, {w:1}).then(function(result){
					resolve(result);
				});
			});
		}).catch(function(err){
			reject(err);
		});
	}.bind(this));
};

MongoIndex.prototype.retrieve = function(queryTerms){
	return new Promise(function (resolve, reject) {
		this.db.collectionAsync('index').bind(this).then(function(collection){
			return collection.findAsync({
				$or:queryTerms.map(function(term){
						return {
							'terms.term': term
						};
					})
			});
		}).then(function(cursor){
			return cursor.toArrayAsync();
		}).then(function(docs){
			return this.rank(queryTerms, docs);
		}).then(function(rankedDocs){
			resolve(rankedDocs);
		}).catch(function(err){
			reject(err);
		});
	}.bind(this));
};

MongoIndex.prototype.rank = function(queryTerms, docs){
	return new Promise(function (resolve, reject) {
		docs.forEach(function(doc){
			doc.score = 0;
			doc.terms.forEach(function(term) {
				// Only look at the term if it is part of the query
				if (queryTerms.indexOf(term.term) != -1) {
					doc.score += term.weight;
					//TODO: calculate IDF
					doc.score *= Math.log(docs.length/1);
				}
			});
			delete doc.terms;
		});
		docs.sort(function compare(a, b) {
			return b.score-a.score;
		});
		resolve(docs);
	});
};

exports.getDocIndex = function(){
	return new Promise(function (resolve, reject) {
		new MongoIndex().then(function(docIndex){
			resolve(docIndex);
		}).catch(function(err){
			reject(err);
		});
	});
};