var Promise = require("bluebird");

var MockIndex = function(){
	return new Promise(function (resolve, reject) {
		resolve(this);
	}.bind(this));
};

MockIndex.prototype.add = function(docId, terms) {
	return new Promise(function (resolve, reject) {
		resolve({
			id: docId,
			weightedTerms: terms
		});
	});
};

exports.getMockIndex = function(){
	return new Promise(function (resolve, reject) {
		new MockIndex().then(function(docIndex){
			resolve(docIndex);
		}).catch(function(err){
			reject(err);
		});
	});
};