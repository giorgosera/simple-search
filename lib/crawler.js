var Promise = require("bluebird"),
	request = Promise.promisifyAll(require("request")),
	cheerio = require('cheerio'),
	urllib = require('url');

function Crawler(options){
	this.discoveredUrls = [];
}

Crawler.prototype.crawl = function(url){
	this.fetchPage(url).bind(this).then(function(body){
		return this.indexPage(url, body);
	}).then(function(){
		if (this.discoveredUrls.length > 0){
			var nextUrl = this.discoveredUrls.shift();
			this.crawl(nextUrl);
		} else {
			console.log('Crawling is over!');
		}
	}).catch(function(err){
		//TODO: Skip page
	});
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
	}.bind(this));
};

exports.crawl = function(startUrl){
	crawler = new Crawler();
	crawler.crawl(startUrl);
};