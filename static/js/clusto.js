clusto = {};

clusto.API = function() {
    var self = this;
    self.endpoint = '/clusto/api';
};  

clusto.API.prototype.get_by_name = function(name, callback) {
    var self = this;
    d3.json(self.endpoint + '/query/get_by_name?name=' + name, function(data) {
		if(callback) {
        	callback(new clusto.Entity(self, data.object, data));
		}
    });
};

clusto.API.prototype.get_from_pools = function(pools, callback) {
	var self = this;
	d3.json(self.endpoint + '/query/get_from_pools?pools=' + pools.join(','), function(d) {
		callback(d.map(function(name) {
			return new clusto.Entity(self, name);
		}));
	});
};

clusto.Entity = function(api, name, data) {
	var self = this;
	self.api = api;
	self.name = name;
	if(data) {
		self.update(data);
	}/*else{
		self.fetch();
	}*/
};

clusto.Entity.prototype.update = function(data) {
	var self = this;
	self.data = data;
	self.name = data.object;
	self.driver = data.driver;
	self.attrs = data.attrs;
	self.contents = data.contents.map(function(d) {
		return new clusto.Entity(self.api, d); });
	self.parents = data.parents.map(function(d) {
		return new clusto.Entity(self.api, d); });
	/*data.actions.forEach(function(d) {
		self[d] = function(params) {
			console.log('TODO: perform ' + d + ' action on ' + self.name + ' with args ' + params);
		};
	});*/
};

clusto.Entity.prototype.fetch = function(callback) {
	var self = this;
	if(self.name.indexOf('/') != -1) {
		var url = self.api.endpoint + self.name;
	}else{
		var url = self.api.endpoint + '/query/get_by_name?name=' + self.name;
	}
	d3.json(url, function(d) {
		self.update(d);
		if(callback) {
			callback(self);
		}
	});
};
