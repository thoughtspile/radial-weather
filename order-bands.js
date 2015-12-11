// (function() {
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

    var radius = Math.min(w, h) / 2;
    var ratio = .2;
    var inner = ratio * radius;


    mskt = dailyMean(mskt);

    var tlow = _.min(mskt, 'temp').temp;
    var thigh = _.max(mskt, 'temp').temp;
    var r = d3.scale.linear()
        .domain([tlow, thigh])
        .range([inner, radius]);

    mskt = binOrderDaily(mskt);

    var dateFmt = d3.time.format("%m-%d");
    mskt.forEach(function(rec) { rec.time = dateFmt.parse(rec.time); });
    var times = d3.extent(mskt, function(rec) {return rec.time; });
    var ang = d3.scale.linear()
        .domain(times)
        .range([0, Math.PI * 2]);

    var plot = function(i) {
        return d3.svg.line.radial()
            .angle(function(pt) { return ang(pt.time) })
            .radius(function(pt) { return r(pt.temp[i]); })
            .interpolate('basis');
            // .interpolate(movingAvg(4));
    };

    tempGrad(svg, r, inner, radius);
    monthGrid(svg, inner, radius);
    tempGrid(svg, r);

    _.pull(mskt, _.min(mskt, 'temp.length'));
    mskt = _.sortBy(mskt, 'time');
    var bands = _.max(mskt, 'temp.length').temp.length;

    svg.selectAll("path")
        .data(_.range(bands))
        .enter()
            .append('path')
                .attr("class", "line")
                .style('stroke', 'url(#g1)')
                .attr("d", function(i) { return plot(i)(mskt); });
// }());
