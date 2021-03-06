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
    var ratio = .8;
    var inner = ratio * radius;
    var cats = ['white', 'blue', 'lightblue', 'orange', 'red'];

    var palette = d3.scale.quantize()
        .domain([-40, 0, 40])
        .range(cats.slice(1));

    mskt = dailyMean(mskt);
    mskt = binCatsDaily(mskt, palette)
        .map(function(day) {
            day.distr = _.mapValues(_.countBy(day.temp), function(count) {
                return count / day.temp.length;
            });
            cats.forEach(function(cat) {
                day.distr[cat] = day.distr[cat] || 0;
            });
            cats.slice(1).forEach(function(cat, i) {
                day.distr[cat] += day.distr[cats[i]] || 0;
            })
            return day;
        });
    // console.log(_.map(mskt, 'distr.lightblue'));

    var dateFmt = d3.time.format("%m-%d");
    mskt.forEach(function(rec) { rec.time = dateFmt.parse(rec.time); });
    // console.log(_.map(mskt, 'time'));

    var times = d3.extent(mskt, function(rec) {return rec.time; });
    var ang = d3.scale.linear()
        .domain(times)
        .range([0, Math.PI * 2]);

    var r = d3.scale.linear()
        .domain([0, 1])
        .range([inner, radius]);

    var plot = function(cat) {
        return d3.svg.line.radial()
            .angle(function(pt) { return ang(pt.time) })
            .radius(function(pt) { return r(pt.distr[cat]); })
            .interpolate('basis');
    };

    monthGrid(svg, inner, radius);

    svg.selectAll("path")
        .data(cats.reverse())
        .enter()
            .append('path')
            .attr("class", "line")
            .style('fill', _.identity)
            // .datum(_.sortBy(mskt, 'time'))
            .attr("d", function(cat) {
                return plot(cat)(_.sortBy(mskt, 'time'));
            });
// }());
