// (function() {
    var radius = Math.min(w, h) / 2;
    var ratio = .7;
    var gap = -1;

    mskt = dailyMean(mskt);
    mskt.forEach(function(rec) { rec.time = dateFmt.parse(rec.time); })

    var times = d3.extent(mskt, function(rec) {return rec.time; });
    var ang = d3.scale.linear()
        .domain(times)
        .range([0, (times[1] - times[0]) / period * Math.PI * 2]);

    var layerWidth = radius * (1 - ratio) / Math.abs((times[0] - _.last(times)) / period);
    var r = d3.scale.linear()
        .domain(times)
        .range([ratio * radius + layerWidth / 2, radius - layerWidth / 2]);

    var plot = d3.svg.line.radial()
        .angle(function(pt) { return ang(pt.time) })
        .radius(function(pt) { return r(pt.time) });

    var palette = d3.scale.quantize()
        .domain([-40, 0, 40])
        .range(['blue', 'lightblue', 'orange', 'red']);

    var segments = compoundSegments(mskt, palette);

    svg.selectAll("path")
        .data(segments)
        .enter().append('path')
            .attr("class", "line")
            .attr("d", plot)
            .attr('stroke-width', layerWidth - gap)
            .attr('stroke', function(pt) { return palette(pt[0].temp); })

    monthGrid(svg, ratio * radius, radius);
// }());
