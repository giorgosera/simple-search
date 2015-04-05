var MockIndex = require('./mockDb'),
	assert = require("assert"),
	should = require('should'),
	expect = require('expect'),
	md5 = require('MD5'),
	searchEngine = require('../lib/main'),
	request = require('supertest'),
	logger = require('../lib/logger'),
	Cache = require('../lib/linkedHashMap')
	app = null;

    
describe('Test suite for simple-search', function(){
	before(function(done){
		//Intialize search engine with a mock db
		new MockIndex().then(function(mockIndex){
			return searchEngine.setDb(mockIndex);
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


	describe('The Index API', function(){
		it('should tokenize, stem and calculcate term frequencies for a document', function(done){
			request(app)
				.post('/index/testIndex/1')
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

		it('should return an error if the document body is missing', function(done){
			request(app)
				.post('/index/testIndex/1')
				.expect(400, done);
		});

		it('should return an error if the index name is missing', function(done){
			request(app)
				.post('/index/1')
				.expect(404, done);
		});
	});

	describe('The Search API', function(){
		it('should return an error if query string is missing', function(done){
			request(app)
				.get('/search/testIndex')
				.expect(400, done);
		});
	});
    
    
    describe('The LRU Cache API', function(){
        
        it('should have a default size', function(){
            var cache = new Cache();
            should(cache.maxLength).be.equal(10000);
        });
        
        it('should return an error if no values are passed', function(){
            var cache = new Cache();
            var result = cache.addItem();
            should.equal(result,null);
        });
        
        it('should return null if no key is passed in cache', function(){
            var cache = new Cache();
            var result = cache.get();
            should.equal(result,null);
        });
        
        it('should return the results from db if there is a miss in cache', function(){
            var cache = new Cache(); // created new empty cache
            request(app)
                .get('/search/testIndex/?q=test%20document')
                .expect(200)
                .end(function(res){
                    res.body.result.body.should.match("This is a test document. It is simply a sentence, not really a document!");
                    done();
                });
        });
        
        it('should return the results from cache if there is a hit', function(){
            var cache = new Cache(); // created new empty cache
            var hashKey = md5('test document');
            var item = {        
                key: hashKey,       
                value: 'This is a test document. It came from cache!',
                prev: null,
                next: null
            };
            cache.addItem(hashKey,item);
            request(app)
                .get('/search/testIndex/?q=test%20document')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err) throw err;
                    res.body.result.body.should.match("This is a test document. It came from cache!");
                    done();
                });
        });
        
        it('should always add the new item at the head of the list', function(){
            var cache = new Cache(2); // created new empty cache
            cache.addItem('foo',42);
            cache.addItem('foo1',43);   //this should be at the head
            var result = cache.get('foo1');
            result.next.value.should.be.equal(42); //meaning the next value of head should point at foo-42
        });
        
        it('should delete oldest item(tail) when cache size is reached', function(){
            var cache = new Cache(4); // created new cache with size 4
            cache.addItem('foo',42);
            cache.addItem('foo1',43);
            cache.addItem('foo2',44);   //max size reached, foo-42 should be deleted,and 
            cache.addItem('foo3',45);
            cache.addItem('foo4',46);
            //we inserted 5 items in a 4sized list so our new tail according to insertion order should be foo1, 43
            cache.tail.value.should.be.equal(43);
        });
        
        it('should persist our access order',function(){
            var cache = new Cache(4); // created new cache with size 4
            cache.addItem('foo',42);
            cache.addItem('foo1',43);
            cache.addItem('foo2',44);    
            cache.addItem('foo3',45);   //this is the curr head
            var result = cache.get('foo2');     //we accessed pair foo2-44, meaning that should be our new head
            cache.addItem('foo2',44);
            cache.head.value.should.be.equal(44);
        })
    });
});