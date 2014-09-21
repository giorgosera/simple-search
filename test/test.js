var assert = require("assert"),
	indexer = require('../lib/indexer');

describe('The indexer', function(){
	it('should parse the text content of an HTML document', function(done){
		var exampleHTML = '<html><head>This is the head</head><body><h1>This is the body</h1><div>Sample text</div></body></html>';
		indexer.index('http://www.example.com', exampleHTML).then(function(){
			done();
		});
    });
});

describe('Querying', function(){
});