donuts.vis = (function() {
    function draw(data) {
        data = normalizeTime(dailyMean(data), 2 * Math.PI);
        var plot = factory.spiralLayoutR(data);

        d3.select(this).selectAll("path")
            .data(compoundSegments(data, factory.palette))
            .enter().append('path')
                .attr("class", "line")
                .attr("d", plot)
                .attr('stroke-width', factory.config.layerWidth - factory.config.gap)
                .attr('stroke', function(pt) {
                    return factory.palette(pt[0].temp);
                });
    };

    var factory = donuts.base(draw);
    return factory;
}());
