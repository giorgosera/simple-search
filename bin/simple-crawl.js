#!/usr/bin/env node
var program = require('commander'),
	crawler = require('../lib/crawler.js');

program
  .version('0.0.1')
  .option('-s, --starturl <starturl>', 'The initial url')
  .parse(process.argv);

crawler.crawl(program.starturl);
