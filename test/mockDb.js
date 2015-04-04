var Promise = require("bluebird");

var MockIndex = function(){
	return new Promise(function (resolve, reject) {
		resolve(this);
	}.bind(this));
};

MockIndex.prototype.add = function(indexName, docId, body, terms) {
	return new Promise(function (resolve, reject) {
		resolve({
			id: docId,
			weightedTerms: terms
		});
	});
};

MockIndex.prototype.retrieve = function(indexName, queryTerms){
    return new Promise(function (resolve, reject) {
        resolve({
            terms: queryTerms
        });
    });
};

module.exports = MockIndex;