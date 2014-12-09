
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

	var self = this;

	this._add('clients.list', function() {
		return self._get('clients/list');
	});

	this._add('devices.list', function() {
		return self._get('devices/list');
	});

	/* EVENTS */
	this._add('events.list', function() {
		return self._get('events/list');
	});

	this._add('event.info', function(options) {
		return self._get('event/info', {id: options.id});
	});

	/*
		id	
		 	The id of the event
		description	
		 	A user friendly description for this event
		minRepeatInterval	
		 	Sets the minimum time that needs to pass before this event can execute again. Defaults to 30 seconds.
		active	
		 	Is the event active or paused?
	*/
	this._add('event.setEvent', function(options) {
		return self._get('event/setEvent', {
			id: options.id,
			description: options.description,
			minRepeatInterval: options.minRepeatInterval,
			active: options.active
		});
	});	

	/*
		id	
		 	The id of the condition. Leave empty to create a new condition
		eventId	
		 	The id of the event to add the condition to
		group	
		 	The condition group to add this condition to. All conditions in a group must be true for the action to happen. If this is not set or null a new group will be created.
		sensorId	
		 	The id of the sensor to query
		value	
		 	The value to trigger on
		edge	
		 	Rising or falling edge? Accepted values are:
				1: Rising edge. When the current value > set value
				0: Equal. When current value == set value
				-1: Falling edge. When current value < set value
		valueType	
		 	The type of the value. Accepted values are: temp, humidity, wgust (wind gust), wavg (wind average), wdir (wind direction) and rrate (rain rate)
	*/
	this._add('event.setSensorCondition', function(options) {
		return self._get('event/setSensorCondition', {
			id: options.id,
			eventId: options.eventId,
			group: options.group,
			sensorId: options.sensorId,
			value: options.value,
			edge: options.edge,
			valueType: options.valueType
		});
	});	

	/*
		id	
		 	The id of the trigger. Leave empty to create a new trigger
		eventId	
		 	The id of the event to add the trigger to
		sensorId	
		 	The id of the sensor to monitor
		value	
		 	The value to trigger on
		edge	
		 	Rising or falling edge? Accepted values are:
				1: Rising edge. When the new value > old value
				0: Equal. When new value == old value
				-1: Falling edge. When new value < old value
		valueType	
		 	The type of the value. Accepted values are: temp, humidity, wgust (wind gust), wavg (wind average) and rrate (rain rate)
		reloadValue	
		 	(optional) This value sets how much the value must drift before the trigger could be triggered again. This is useful for sensors that swings in the temperature. Default value is one degree.
		
		Example: If the trigger is set to 25 degree and reloadValue is 1, then the temperature needs to reach below 24 or above 26 for this trigger to trigger again.
		Must be in the interval 0.1 - 15
	*/
	this._add('event.setSensorTrigger', function(options) {
		return self._get('event/setSensorTrigger', {
			id: options.id,
			eventId: options.eventId,
			sensorId: options.sensorId,
			value: options.value,
			edge: options.edge,
			valueType: options.valueType,
			reloadValue: options.reloadValue
		});
	});	

	/*
		id	
		 	The id of the action. Leave empty to create a new action
		eventId	
		 	The id of the event to add the action to
		url	
		 	The url to call. Only http is currently supported
		delay	
		 	Number of seconds delay before executing this action. Setting this requires Pro
		delayPolicy	
		 	If this action is activated a second time while waiting on the delay this sets the policy. It could be one of:
				restart: Restarts the timer
				continue: The second activation has no effect. The first timer continues to run
			This have no effect if no delay is set.
	*/
	this._add('event.setURLAction', function(options) {
		return self._get('event/setURLAction', {
			id: options.id,
			eventId: options.eventId,
			url: options.url,
			delay: options.delay,
			delayPolicy: options.delayPolicy
		});
	});

	this._add('event.removeAction', function(options) {
		return self._get('event/removeAction', {id: options.id});
	});	

	this._add('event.removeCondition', function(options) {
		return self._get('event/removeCondition', {id: options.id});
	});	

	this._add('event.removeEvent', function(options) {
		return self._get('event/removeEvent', {id: options.id});
	});	

	this._add('event.removeTrigger', function(options) {
		return self._get('event/removeTrigger', {id: options.id});
	});


	/* SENSORS */
	this._add('sensors.list', function() {
		return self._get('sensors/list');
	});

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

Telldus.prototype._get = function(path, query){
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

Telldus.prototype._add = function(path, fn) {
	path = path.split('.');
	var fnName = path.pop();
	var ob = path.reduce(function(ob, step) {
		return (ob[step] = ob[step] || {});
	}, this);
	ob[fnName] = fn;

}

