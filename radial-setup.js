var donutBase = function(id) {
    var mapElStyle = window.getComputedStyle(document.getElementById(id));
    window.w = parseFloat(mapElStyle.width);
    window.h = parseFloat(mapElStyle.height);

    return d3.select('#' + id).append("svg")
        .attr("width", w)
        .attr("height", h)
        .append('g')
            .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')');
}

var donuts = {};

donuts.base = function(draw) {
    var factory = function(svg) {
        svg.each(factory.draw);
    };

    factory.draw = draw;

    for (var method in donuts.baseMethods) {
        factory[method] = donuts.baseMethods[method];
    }

    factory.config = {
        radius: 1,
        inner: 0,
        ratio: 1,
        gap: -1
    };

    factory.palette = d3.scale.quantize()
        .domain([-40, 0, 40])
        .range(['blue', 'lightblue', 'orange', 'red']);

    return factory;
}

donuts.baseMethods = {
    outer: function(val) {
        if (val == null)
            return this.config.radius;
        this.config.radius = val;
        this.computeRatio();
        return this;
    },
    inner: function(val) {
        if (val == null)
            return this.config.inner;
        this.config.inner = val;
        this.computeRatio();
        return this;
    },
    computeRatio: function() {
        this.config.ratio = this.config.inner / this.config.radius || 0;
    },

    spiralLayoutR: function(data) {
        var radius = this.config.radius;
        var ratio = this.config.ratio;
        var gap = this.config.gap;

        var ang = normalizeTime(data, 2 * Math.PI);
        var endTime = ang.range[1];
        this.config.layerWidth = radius * (1 - ratio) / endTime * 2 * Math.PI;

        var cOffset = this.config.layerWidth / 2;
        var r = d3.scale.linear()
            .domain([0, endTime])
            .range([ratio * radius + cOffset, radius - cOffset]);

        return d3.svg.line.radial()
            .angle(function(pt) { return ang(pt.time); })
            .radius(function(pt) { return r(ang(pt.time)); });
    },
    ringLayout: function(data) {
        var ang = normalizeTime(data, 2 * Math.PI);

        var tlow = _.min(data, 'temp').temp;
        var thigh = _.max(data, 'temp').temp;
        var r = d3.scale.linear()
            .domain([tlow, thigh])
            .range([this.config.inner, this.config.radius]);
        this.r = r;

        return d3.svg.line.radial()
            .angle(function(pt) { return ang(pt.time); })
            .radius(function(pt) { return r(pt.temp); })
            .interpolate('basis');
            // .interpolate(movingAvg(4));
    },

    drawTempGrid: function(svg) {
        var r = this.r;
        var gr = svg.append("g")
            .attr("class", "r axis")
          .selectAll("g")
            .data([-20, 0, 20])
          .enter().append("g");
        gr.append("circle")
            .attr("r", r)
            .style('stroke', 'black')
            .attr('opacity', .15)
        gr.append("text")
            .attr("y", function(d) { return -r(d); })
            .attr("transform", "translate(15, -4) rotate(0)")
            .style("text-anchor", "middle")
            .attr('opacity', '.4')
            .text(_.identity);
    }
};
