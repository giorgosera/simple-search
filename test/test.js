var assert = require("assert"),
	should = require('should'),
	searchEngine = require('../lib/main'),
	request = require('supertest'),
	logger = require('../lib/logger'),
	app = null;

describe('The search engine', function(){
	before(function(done){
		//Intialize search engine with a mock db
		var mockDb = require('./mockDb').getMockIndex().then(function(mockIndex){
			return searchEngine.setIndex(mockIndex);
		}).then(function(){
			return searchEngine.start();
		}).then(function(searchEngineInstance){
			app = searchEngineInstance;
			done();
		}).catch(function(err){
			logger.error("Failed to initialize test search engine server: " + err.message + "\n" + err.stack);
			process.exit(1);
		});
	});

	it('should tokenize, stem and calculcate term frequencies for a document', function(done){
		request(app)
			.post('/index/1')
			.send({
				_body: "This is a test document. It is simply a sentence, not really a document!"
			})
			.expect(200)
			.end(function(err, res){
				if (err) throw err;
				res.body.result.weightedTerms.should.match({
					thi: 0.1111111111111111,
					test: 0.1111111111111111,
					docum: 0.2222222222222222,
					it: 0.1111111111111111,
					simpli: 0.1111111111111111,
					sentenc: 0.1111111111111111,
					not: 0.1111111111111111,
					realli: 0.1111111111111111
				});
				done();
			});
    });

	it('should return an error if document body is missing', function(done){
		request(app)
			.post('/index/1')
			.expect(400, done);
    });
});