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

    var radius = Math.min(w, h) / 2;
    var ratio = .7;

    mskt = dailyMean(mskt);
    mskt.forEach(function(rec) { rec.time = dateFmt.parse(rec.time); })

    var times = d3.extent(mskt, function(rec) {return rec.time; });
    var ang = d3.scale.linear()
        .domain(times)
        .range([0, (times[1] - times[0]) / period * Math.PI * 2]);

    var tlow = _.min(mskt, 'temp').temp;
    var thigh = _.max(mskt, 'temp').temp;

    var layerWidth = radius * (1 - ratio) / Math.abs((times[0] - _.last(times)) / period);
    var r = d3.scale.linear()
        .domain(times)
        .range([ratio * radius + layerWidth / 2, radius - layerWidth / 2]);

    var plot = d3.svg.line.radial()
        .angle(function(pt) { return ang(pt.time) })
        .radius(function(pt) { return r(pt.time) });

    var segments = mskt.slice(1).map(function(pt, i) {
        return [mskt[i], mskt[i + 1]];
    });

    var palette = d3.scale.quantize()
        .domain([-40, 0, 40])
        .range(['blue', 'lightblue', 'orange', 'red']);

    svg.selectAll("path")
        .data(segments)
        .enter().append('path')
            .attr("class", "line")
            .attr("d", plot)
            .attr('stroke-width', layerWidth + 1)
            .attr('stroke', function(pt) { return palette(pt[0].temp); })

    monthGrid(svg, ratio * radius, radius);
// }());
