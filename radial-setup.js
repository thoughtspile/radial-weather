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
        this.config.ratio = this.config.inner / this.config.radius || 0;
        return this;
    },
    inner: function(val) {
        if (val == null)
            return this.config.inner;
        this.config.inner = val;
        this.config.ratio = this.config.inner / this.config.radius || 0;
        return this;
    },
    spiralLayoutR: function(data) {
        var radius = this.config.radius;
        var ratio = this.config.ratio;
        var gap = this.config.gap;

        var endTime = _.max(data, 'time').time;
        this.config.layerWidth = radius * (1 - ratio) / endTime * 2 * Math.PI;

        var r = d3.scale.linear()
            .domain([0, endTime])
            .range([ratio * radius + this.config.layerWidth / 2, radius - this.config.layerWidth / 2]);

        return d3.svg.line.radial()
            .angle(function(pt) { return pt.time; })
            .radius(function(pt) { return r(pt.time) });
    }
};
