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

    var tempGrad = function(svg) {
        var grad = svg.append('radialGradient')
            .attr('id', 'g1')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('cx', 0).attr('cy', 0)
            .attr('r', r(thigh));

        grad.append('stop')
            .attr('offset', r(-20) / (r(thigh) - r(tlow)))
            .attr('stop-color', 'blue');
        grad.append('stop')
            .attr('offset', r(-20) / (r(thigh) - r(tlow)))
            .attr('stop-color', 'lightblue');
        grad.append('stop')
            .attr('offset', r(0) / (r(thigh) - r(tlow)))
            .attr('stop-color', 'lightblue');
        grad.append('stop')
            .attr('offset', r(0) / (r(thigh) - r(tlow)))
            .attr('stop-color', 'orange');
        grad.append('stop')
            .attr('offset', r(20) / (r(thigh) - r(tlow)))
            .attr('stop-color', 'orange');
        grad.append('stop')
            .attr('offset', r(20) / (r(thigh) - r(tlow)))
            .attr('stop-color', 'orangered');

    }


    mskt = dailyMean(mskt);

    var times = d3.extent(mskt, function(rec) {return rec.time; });
    var ang = d3.scale.linear()
        .domain(times)
        .range([0, (times[1] - times[0]) / 3600 / 24 / 365 / 1000 * Math.PI * 2]);

    var tlow = _.min(mskt, 'temp').temp;
    var thigh = _.max(mskt, 'temp').temp;
    var r = d3.scale.linear()
        .domain([tlow, thigh])
        .range([0, Math.min(w, h) / 2]);

    var plot = d3.svg.line.radial()
        .angle(function(pt) { return ang(pt.time) })
        .radius(function(pt) { return r(pt.temp); })
        .interpolate(movingAvg(4));

    tempGrad(svg);
    monthGrid(svg, r);
    tempGrid(svg, r);

    svg.append("path")
        .datum(mskt)
        .attr("class", "line")
        .style('stroke', 'url(#g1)')
        .attr("d", plot);
// }());
