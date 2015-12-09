// (function() {
    var movingAvg = function(n) {
        return function (points) {
            points = points.map(function(each, index, array) {
                var to = index + n - 1;
                var subSeq, sum;
                if (to < points.length) {
                    subSeq = array.slice(index, to + 1);
                    sum = subSeq.reduce(function(a,b) {
                        return [a[0] + b[0], a[1] + b[1]];
                    });
                    return sum.map(function(each) { return each / n; });
                }
                return undefined;
            });
            points = points.filter(function(each) { return typeof each !== 'undefined' })
            // Note that one could re-interpolate the points
            // to form a basis curve (I think...)
            return points.join("L");
        }
    }

    var monthGrid = function(svg, r) {
        var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            .reduce(function(acc, days) {
                acc.push(_.last(acc) + days);
                return acc;
            }, [0])
        var deg = d3.scale.linear()
            .domain([0, _.last(months)])
            .range([-90, 270]);
        console.log(months, deg(months[0]))
        var ga = svg.append("g")
            .attr("class", "a axis")
          .selectAll("g")
            .data(months.slice(0, -1))
          .enter().append("g")
            .attr("transform", function(d) { return "rotate(" + deg(d) + ")"; });
        ga.append("line")
            .attr("x1", r(-20))
            .attr("x2", r(20))
            .attr('opacity', function(dummy, i) {
                return (i + 1) % 3 === 0? .3: .15;
            });
    }

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


    var mapElStyle = window.getComputedStyle(document.getElementById('map'));
    var w = parseFloat(mapElStyle.width);
    var h = parseFloat(mapElStyle.height);

    var svg = d3.select("#map").append("svg")
        .attr("width", w)
        .attr("height", h)
        .append('g')
        .attr('transform', 'translate(' + w/2 + ',' + h/2 + ')');

    var dateFmt = d3.time.format("%Y-%m-%d");
    mskt = d3.nest()
        .key(function(rec) {
            return rec.time.substr(0, 10);
        })
        .rollup(function(times) {
            return d3.mean(times, function(rec) { return rec.temp || 0 });
        })
        .entries(mskt)
        .map(function(rec) {
            return {
                time: dateFmt.parse(rec.key),
                temp: rec.values
            };
        });

    var times = d3.extent(mskt, function(rec) {return rec.time; });
    var ang = d3.scale.linear()
        .domain(times)
        .range([0, (times[1] - times[0]) / 3600 / 24 / 365 / 1000 * Math.PI * 2]);

    var tlow = _.min(mskt, 'temp').temp;
    var thigh = _.max(mskt, 'temp').temp;
    var r = d3.scale.linear()
        .domain([tlow, thigh])
        .range([0, Math.min(w, h) / 2]);

    var rnorm = d3.scale.linear()
        .domain([tlow, thigh])
        .range([0, 1]);
    var tnorm = d3.scale.linear()
        .domain(times)
        .range([0, 1 * (times[1] - times[0]) / (365 * 24 * 10000000)]);

    monthGrid(svg, r);
    tempGrid(svg, r);

    var plot = d3.svg.line.radial()
        .angle(function(pt) { return ang(pt.time) })
        .radius(function(pt) {
            return 75 * (rnorm(0) + tnorm(pt.time))
        })
        .interpolate(movingAvg(4));

    svg.append("path")
        .datum(mskt)
        .attr("class", "line")
        .attr('stroke', d3.scale.category10().domain([-10, 10, 20]))
        .attr("d", plot);
// }());
