donuts.ringFlows = function() {
    var factory = donuts.base(function(data) {
        var cats = ['white', 'blue', 'lightblue', 'orange', 'red'];
        var palette = d3.scale.quantize()
            .domain([-40, 0, 40])
            .range(cats.slice(1));

        data = binCatsDaily(data, palette, cats);

        factory.globals.tlow = 0;
        factory.globals.thigh = 1;

        svg.selectAll("path")
            .data(data.reverse())
            .enter()
                .append('path')
                .attr("class", "line")
                .style('fill', _.property('color'))
                .style('stroke', _.property('color'))
                .attr("d", function(cat) {
                    return factory.ringLayout(cat.data)(cat.data);
                });
    });
    return factory;
};
