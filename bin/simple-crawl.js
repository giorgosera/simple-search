#!/usr/bin/env node
var program = require('commander'),
	index = require('../lib/index.js'),
	crawl = require('../lib/crawl.js'),
	mongodb = require('../db/mongodb'),
	logger = require('../lib/logger');

program
  .version('0.0.1')
  .option('-s, --starturl <starturl>', 'The initial url')
  .parse(process.argv);

mongodb.getDocIndex().then(function(docIndex){
	return index.createIndexer({
		docIndex: docIndex
	});
}).then(function(indexer){
	return crawl.createCrawler({
		indexer: indexer
	});
}).then(function(crawler){
	return crawler.crawl(program.starturl);
}).then(function(results){
	logger.info("Finished crawling.");
}).catch(function(err){
	logger.error("Crawling failed: " + err.message + "\n" + err.stack);
	process.exit(1);
});

