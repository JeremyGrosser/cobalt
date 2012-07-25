var Clusto = new clusto.API();
Clusto.get_from_pools(['production', 'dispatch'], function(pool) {
	var svg = d3.select('#chart')
		.append('div')
		//.attr('id', 'cpu-user')
		.style('height', '300px')
		.append('svg:svg');
	var chart = new cobalt.Chart(svg, 10000);

	//pool.contents.forEach(function(server) {
	pool.forEach(function(server) {
		var name = server.name.split('/')[2];
		var metric = new cobalt.Metric(function() {
			var options = {host: name};

			options.metric = d3.select('#chart-metric').property('value');

			var settings = d3.select('#chart-timerange').property('value');
			if(settings) {
				settings = settings.split(',');
				options.timerange = settings[0];
				options.resolution = settings[1];
			}

			return options;
		});
		chart.addMetric(metric);
	});
	chart.update();

	d3.select('#chart-timerange').on('change', function() { chart.update(); });
	d3.select('#chart-metric').on('change', function() { chart.update(); });
});
