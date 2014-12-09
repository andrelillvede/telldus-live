
var consumerKey = 'FEHUVEW84RAFR5SP22RABURUPHAFRUNU';
var consumerSecret = 'ZUXEVEGA9USTAZEWRETHAQUBUR69U6EF';
var token = 'f3ba3073214f7f1debf7988ca7ad7f160505dd084';
var tokenSecret = 'be331de32db691e58899bab348fdf00a';

var OAuth = Npm.require('oauth');
var Future = Npm.require('fibers/future');
var querystring = Npm.require('querystring');



Telldus = function Telldus(options){
	if (!(this instanceof Telldus)) return new Telldus(options);

	this.options = options;
	this._apiUrl = 'http://api.telldus.com/json/'

	this._oauth = new OAuth.OAuth(
		'http://api.telldus.com/oauth/requestToken',
		'http://api.telldus.com/oauth/accessToken',
		this.options.consumerKey,
		this.options.consumerSecret,
		'1.0',
		null,
		'HMAC-SHA1'
		);
}

Telldus.prototype.command = function(path, options){
	var fut = new Future();

	var queryString = querystring.stringify(options);

	if(queryString !== '')
		queryString = '?'+queryString;

	var url = this._apiUrl + path + queryString; // e.g http://api.telldus.com/json/ + sensor/info + ?id="id"
	
	this._oauth.get(url, this.options.token, this.options.tokenSecret,  function (error, data, response) {
		if (error) {
			fut.throw(error);
			return
		}

		try {
			fut.return(JSON.parse(data))
		} catch (e) {
			fut.throw(e);
		}
	});

	return fut.wait();
}


