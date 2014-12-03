
var consumerKey = 'FEHUVEW84RAFR5SP22RABURUPHAFRUNU';
var consumerSecret = 'ZUXEVEGA9USTAZEWRETHAQUBUR69U6EF';
var token = 'f3ba3073214f7f1debf7988ca7ad7f160505dd084';
var tokenSecret = 'be331de32db691e58899bab348fdf00a';

var OAuth = Npm.require('oauth');
var Future = Npm.require('fibers/future');
var querystring = Npm.require('querystring');



Tellstick = function Tellstick(options){
	if (!(this instanceof Tellstick)) return new Tellstick(options);

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

	var self = this;

	this._add('clients.list', function() {
		return self._get('clients/list');
	});

	this._add('devices.list', function() {
		return self._get('devices/list');
	});

	this._add('events.list', function() {
		return self._get('events/list');
	});

	this._add('sensors.list', function() {
		return self._get('sensors/list');
	});	

	/* SENSOR */
	this._add('sensor.info', function(id) {
		return self._get('sensor/info', {id: id});
	});

	this._add('sensor.setName', function(id, name) {
		return self._get('sensor/setName', {
			id: id,
			name: name
		});
	});	

	this._add('sensor.setIgnore', function(id, ignore) {
		return self._get('sensor/setName', {
			id: id,
			ignore: ignore
		});
	});

}

Tellstick.prototype._get = function(path, query){
	var fut = new Future();

	var queryString = querystring.stringify(query);

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

Tellstick.prototype._add = function(path, fn) {
	path = path.split('.');
	var fnName = path.pop();
	var ob = path.reduce(function(ob, step) {
		return (ob[step] = ob[step] || {});
	}, this);
	ob[fnName] = fn;

}

