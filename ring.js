donuts.ringLine = function() {
    var factory = donuts.base(function(data) {
        var plot = factory.ringLayout(data);
        tempGrad(d3.select(this),
            factory.globals.tlow, factory.globals.thigh,
            factory.r, factory.inner(), factory.outer());
        d3.select(this).append('path')
            .attr('class', 'line')
            .style('stroke', 'url(#g1)')
            .attr('d', plot(data));
            // .data(sharpSegments(data, factory.palette))
            // .enter().append("path")
            //     .attr("class", "line")
            //     .style('stroke', function(pt) {
            //         return factory.palette(_.last(pt).temp);
            //     })
            //     .attr("d", plot);
    });
    return factory;
};
