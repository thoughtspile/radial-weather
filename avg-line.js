donuts.vis = (function() {
    var factory = donuts.base(function(data) {
        data = _.sortBy(binMeanDaily(dailyMean(data)), 'time');
        var plot = factory.ringLayout(data);

        d3.select(this).selectAll('path')
            .data(compoundSegments(data, factory.palette))
            .enter().append("path")
                .attr("class", "line")
                .style('stroke', function(pt) {
                    return factory.palette(pt[0].temp);
                })
                .attr("d", plot);
    });
    return factory;
}());
