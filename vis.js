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
        var ga = svg.append("g")
            .attr("class", "a axis")
          .selectAll("g")
            .data(d3.range(0, 360, 30))
          .enter().append("g")
            .attr("transform", function(d) { return "rotate(" + -d + ")"; });
        ga.append("line")
            .attr("x1", r.range()[0])
            .attr("x2", r.range()[1])
            .attr('opacity', function(dummy, i) {
                return (i - 1) % 3 === 0? .5: .2;
            });
    }

    var tempGrid = function(svg, r) {
        var gr = svg.append("g")
            .attr("class", "r axis")
          .selectAll("g")
            .data([-20, 0, 20, r.domain()[1]])
          .enter().append("g");
        gr.append("circle")
            .attr("r", r)
            .attr('opacity', .2);
        gr.append("text")
            .attr("y", function(d) { return -r(d); })
            .attr("transform", "translate(15, -4) rotate(0)")
            .style("text-anchor", "middle")
            .text(function(d) { return d; });
    };


    var mapElStyle = window.getComputedStyle(document.getElementById('map'));
    var w = parseFloat(mapElStyle.width);
    var h = parseFloat(mapElStyle.height);

    var svg = d3.select("#map").append("svg")
        .attr("width", w)
        .attr("height", h)
        .append('g')
        .attr('transform', 'translate(' + w/2 + ',' + h/2 + ')');

    // mskt = mskt.filter((dumm, i) => i % 30 == 0)

    _.each(mskt, function(rec) { rec.time = Date.parse(rec.time); });
    var start = _.min(mskt, 'time').time;
    var end = _.max(mskt, 'time').time;
    console.log((end-start) / 3600 / 24 / 365 / 1000);
    _.each(mskt, function(rec) {
        rec.time = (rec.time - start) / 3600 / 24 / 365 / 1000 * Math.PI * 2;
    });

    mskt = mskt.filter(rec => !isNaN(rec.temp) && !isNaN(rec.time))
    var tlow = _.min(mskt, 'temp').temp;
    var thigh = _.max(mskt, 'temp').temp;
    var r = d3.scale.linear()
        .domain([tlow, thigh])
        .range([0, Math.min(w, h) / 2]);

    var plot = d3.svg.line.radial()
        .angle(function(pt) { return pt.time })
        .radius(function(pt) { return r(pt.temp); })
        .interpolate(movingAvg(120));

    var grad = svg.append('radialGradient')
        .attr('id', 'g1')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('cx', 0).attr('cy', 0)
        .attr('r', r(thigh));
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

    svg.append("path")
        .datum(mskt)
        .attr("class", "line")
        .style('stroke', 'url(#g1)')
        .attr("d", plot);

    monthGrid(svg, r);
    tempGrid(svg, r);
// }());
