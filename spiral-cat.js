donuts.spiralCats = function() {
    var factory = donuts.base(function(data) {
        d3.select(this).selectAll("path")
            .data(compoundSegments(data, factory.palette))
            .enter().append('path')
                .attr("class", "line")
                .attr("d", factory.spiralLayoutR(data))
                .attr('stroke-width', factory.config.layerWidth - factory.config.gap)
                .attr('stroke', function(pt) {
                    return factory.palette(pt[0].temp);
                });
    });
    return factory;
};
