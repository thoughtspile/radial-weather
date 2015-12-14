donuts.vis = (function() {
    var tempGrid = function(svg, r) {
        var gr = svg.append("g")
            .attr("class", "r axis")
          .selectAll("g")
            .data([-20, 0, 20])
          .enter().append("g");
        gr.append("circle")
            .attr("r", r)
            .attr('opacity', .15)
        gr.append("text")
            .attr("y", function(d) { return -r(d); })
            .attr("transform", "translate(15, -4) rotate(0)")
            .style("text-anchor", "middle")
            .attr('opacity', '.4')
            .text(function(d) { return d; });
    };

    var tempGrad = function(svg, scale, inner, outer) {
        var grad = svg.append('radialGradient')
            .attr('id', 'g1')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('cx', 0).attr('cy', 0)
            .attr('r', r(thigh));

        var stopOffset = function(temp) {
            return (scale(temp) - inner) / (outer - inner);
        };

        var bands = [
            {temp: -100, color: 'blue'},
            {temp: -20, color: 'blue'},
            {temp: -20, color: 'lightblue'},
            {temp: 0, color: 'lightblue'},
            {temp: 0, color: 'orange'},
            {temp: 20, color: 'orange'},
            {temp: 20, color: 'red'},
            {temp: 100, color: 'red'}
        ];

        grad.selectAll('stop')
            .data(bands)
            .enter()
            .append('stop')
                .attr('offset', function(band) {
                    return stopOffset(band.temp);
                })
                .attr('stop-color', function(band) {
                    return band.color;
                });
    }


    function draw(data) {
        var svg = d3.select(this);

        data = dailyMean(data);
        data = binMeanDaily(data);
        data.forEach(function(rec) {
            rec.time = dateFmt.parse(rec.time);
        });

        var times = d3.extent(data, function(rec) { return rec.time; });
        var ang = d3.scale.linear()
            .domain(times)
            .range([0, Math.PI * 2]);

        var tlow = _.min(data, 'temp').temp;
        var thigh = _.max(data, 'temp').temp;
        var r = d3.scale.linear()
            .domain([tlow, thigh])
            .range([config.inner, config.radius]);

        var plot = d3.svg.line.radial()
            .angle(function(pt) { return ang(pt.time) })
            .radius(function(pt) { return r(pt.temp); })
            .interpolate('basis');
            // .interpolate(movingAvg(4));

        // tempGrad(svg, r, config.inner, config.radius);
        // tempGrid(svg, r);

        svg.append("path")
            .datum(_.sortBy(data, 'time'))
            .attr("class", "line")
            .style('stroke', 'url(#g1)')
            .attr("d", plot);
    };

    var factory = donuts.base();
    factory.vis = draw;
    return factory;
}());
