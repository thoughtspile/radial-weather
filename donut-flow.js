donuts.vis = (function() {
    var factory = donuts.base(function(data) {
        var cats = ['white', 'blue', 'lightblue', 'orange', 'red'];
        var palette = d3.scale.quantize()
            .domain([-40, 0, 40])
            .range(cats.slice(1));

        data = dailyMean(data);
        data = binCatsDaily(data, palette, cats);
        data = _.sortBy(data, 'time');

        data = cats.map(function(cat) {
            return {
                color: cat,
                data: data.map(function(rec) {
                    return {
                        time: rec.time,
                        temp: rec.distr[cat]
                    };
                })
            };
        });

        svg.selectAll("path")
            .data(data.reverse())
            .enter()
                .append('path')
                .attr("class", "line")
                .style('fill', _.property('color'))
                .style('stroke', _.property('color'))
                .attr("d", function(cat) {
                    console.log(cat)
                    return factory.ringLayout(cat.data)(cat.data);
                });
    });
    return factory;
}());
