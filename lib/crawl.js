var Promise = require("bluebird"),
	request = Promise.promisifyAll(require("request")),
	cheerio = require('cheerio'),
	urllib = require('url'),
	logger = require('./logger');

function Crawler(options){
	options = options || {};
	this.indexer = options.indexer;
	this.discoveredUrls = [];
}

Crawler.prototype.crawl = function(url){
	logger.info('Crawling ' + url);
	return new Promise(function (resolve, reject) {
		this.fetchPage(url).bind(this).then(function(body){
			return this.indexPage(url, body);
		}).then(function(){
			if (this.discoveredUrls.length > 0){
				var nextUrl = this.discoveredUrls.shift();
				this.crawl(nextUrl);
			} else {
				resolve();
			}
		}).catch(function(err){
			reject(err);
		});
	}.bind(this));
};

Crawler.prototype.fetchPage = function(url){
	return new Promise(function (resolve, reject) {
		request.getAsync(url).then(function(response) {
			resolve(response[0].body);
		}).catch(function(err){
			reject(err);
		});
	});
};

Crawler.prototype.indexPage = function(url, body){
	return new Promise(function (resolve, reject) {
		var $ = cheerio.load(body);
		this.indexer.index(url, body).bind(this).then(function(){
			$('a').each(function(i, e) {
				var link = $(e);
				if (link.attr('href')){
					var thisUrl = urllib.resolve(url, link.attr('href'));
					if (this.discoveredUrls.indexOf(thisUrl) === -1){
						this.discoveredUrls.push(thisUrl);
					}
				}
			}.bind(this));
			resolve();
		}).catch(function(err){
			reject(err);
		});
	}.bind(this));
};

exports.createCrawler = function(options){
	return new Promise(function (resolve, reject) {
		var crawler = new Crawler(options);
		resolve(crawler);
	});
};