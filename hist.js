// (function() {
    mskt = dailyMean(mskt);
    mskt = binOrderDaily(mskt);

    _.pull(mskt, _.min(mskt, 'temp.length'));
    mskt = _.sortBy(mskt, 'time');
    var bands = _.max(mskt, 'temp.length').temp.length;
    var norm = mskt.reduce(function(acc, rec) {
        var data = rec.temp;
        var m = d3.mean(data);
        var std = d3.deviation(data);
        acc.push.apply(acc, data.map(function(val) {
            return (val - m) / std;
        }));
        return acc;
    }, []);

    var x = d3.scale.linear()
        .domain([d3.min(norm), d3.max(norm)])
        .range([-w/2, w/2]);

    var data = d3.layout.histogram()
        .bins(x.ticks(100))
        (norm);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([h/5, -h/5]);

    var bar = svg.selectAll(".bar")
        .data(data)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(data[1].x) - x(data[0].x))
        .style('stroke', 'white')
        .style('fill', 'skyblue')
        .attr("height", function(d) { return h/5 - y(d.y); });

// }());
