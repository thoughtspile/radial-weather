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

    // console.log(mskt)

    var low = _.min(mskt, 'temp').temp;
    var high = _.max(mskt, 'temp').temp;
    _.each(mskt, function(rec) { rec.temp = (rec.temp - low) / (high - low) * Math.min(w, h) / 2; });
    mskt = mskt.filter(rec => !isNaN(rec.temp) && !isNaN(rec.time))

    var plot = d3.svg.line.radial()
        .angle(function(pt) { return pt.time })
        .radius(function(pt) { return pt.temp; })
        .interpolate(movingAvg(120));

    svg.append("path")
        .datum(mskt)
        .attr("class", "line")
        .attr("d", plot);

    var ga = svg.append("g")
        .attr("class", "a axis")
      .selectAll("g")
        .data(d3.range(0, 360, 30))
      .enter().append("g")
        .attr("transform", function(d) { return "rotate(" + -d + ")"; });
    ga.append("line")
        .attr("x2",10000)
        .attr('opacity', .2);

    var r = d3.scale.linear()
        .domain([0, .5])
        .range([0, 1000]);

    var gr = svg.append("g")
        .attr("class", "r axis")
      .selectAll("g")
        .data(r.ticks(50).slice(1))
      .enter().append("g");

    gr.append("circle")
        .attr("r", r)
        .attr('opacity', .2);

// }());
