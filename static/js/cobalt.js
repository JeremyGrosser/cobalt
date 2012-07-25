cobalt = {};

cobalt.Chart = function(el, interval) {
	var self = this;
	if(el instanceof String) {
		self.el = d3.select(el);
	}else{
		self.el = el;
	}
	self.interval = interval;
	self.metrics = [];
	self.metricData = [];

	//self.chart = nv.models.lineWithFocusChart();
	self.chart = nv.models.lineChart();
	//self.chart = nv.models.stackedAreaChart();
	self.chart.color(d3.scale.category10().range());
	self.chart.xAxis
		//.axisLabel('Time')
		//.scale(d3.time.minutes, 60)
		.tickFormat(function(d) {
			return d3.time.format('%I:%M%p')(new Date(d));
		});
	//self.chart.x2Axis
	//	.tickFormat(function(d) {
	//		return d3.time.format('%b %d')(new Date(d)); });
	self.chart.yAxis
		.tickFormat(d3.format(',.2f'));
	nv.addGraph(function() { return self.chart; });
	nv.utils.windowResize(function() { return self.chart.update(); });

	if(self.interval) {
		window.setInterval(function() {
			self.update();
		}, self.interval);
	}
	self.update();
};

cobalt.Chart.prototype.redraw = function(data) {
	var self = this;
	self.el.datum(self.metricData)
		.call(self.chart);
};

cobalt.Chart.prototype.addMetric = function(metric) {
	var self = this;
	if(self.metrics.indexOf(metric) == -1) {
		self.metrics.push(metric);
		self.metricData.push({key: metric.seriesName, values: []});
	}else{
		console.log('Cannot add a metric to a chart twice! ' + metric);
	}
};

cobalt.Chart.prototype.update = function() {
	var self = this;
	self.metrics.forEach(function(metric, i) {
		metric.update(function(data) {
			self.metricData[i].key = metric.seriesName;
			self.metricData[i].values = data.values;
			self.redraw();
		});
	});
};

cobalt.Metric = function(f) {
	var self = this;
	self.options = f;
	self.update();
};

cobalt.Metric.prototype.update = function(callback) {
	var self = this;

	var opts = self.options();
	self.host = opts.host;
	self.name = opts.metric;
	self.seriesName = self.host;

	var params = ['timerange', 'resolution'];
	var qs = params.map(function(param) {
		if(opts[param]) {
			return param + '=' + opts[param];
		}
	}).filter(function(v) { return v; }).join('&');
	if(qs) {
		qs = '?' + qs;
	}

	d3.json('/data/metrics/' + self.host + '.' + self.name + qs, function(d) {
		d.values = d.values.map(function(value) {
			return {x: value[0] * 1000, y: value[1]};
		});
		//self.seriesName = d.key;
		if(callback) {
			callback(d);
		}
	});
};
