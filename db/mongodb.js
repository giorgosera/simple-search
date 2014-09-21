var Promise = require("bluebird"),
	mongodb = Promise.promisifyAll(require('mongodb')),
	MongoClient = mongodb.MongoClient,
	Server = require('mongodb').Server,
	logger = require('../lib/logger');

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

MongoIndex.prototype.add = function(docId, terms) {
	return new Promise(function (resolve, reject) {
		this.db.collectionAsync('index').then(function(collection) {
			collection.ensureIndexAsync("terms.term").then(function(){
				var doc = {
					doc_id: docId,
					terms: terms
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

exports.getDocIndex = function(){
	return new Promise(function (resolve, reject) {
		new MongoIndex().then(function(docIndex){
			resolve(docIndex);
		});
	});
};