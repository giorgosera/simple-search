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

MockIndex.prototype.retrieve = function(indexName, queryTerms,docId,body){
    var doc = {
                doc_id: docId,
                body: body,
            };
    return new Promise(function (resolve, reject) {
        resolve({
            docs: doc
        });
    });
};

module.exports = MockIndex;