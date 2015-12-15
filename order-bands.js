donuts.ringOrders = function() {
    var factory = donuts.base(function(data) {
        factory.globals.tlow = d3.min(data, _.property('temp'));
        factory.globals.thigh = d3.max(data, _.property('temp'));
        data = binOrderDaily(data);

        // remove feb 29
        _.pull(data, _.min(data, 'temp.length'));
        var bands = _.max(data, 'temp.length').temp.length;

        var plot = function(i) {
            return d3.svg.line.radial()
                .angle(function(pt) { return ang(pt.time); })
                .radius(function(pt) {
                    return r(pt.temp.length > i? pt.temp[i]: _.last(pt.temp));
                })
                .interpolate('basis');
        };
        data = _.range(bands).map(function(cat) {
            return data.map(function(rec) {
                return {
                    time: rec.time,
                    temp: rec.temp[cat]
                };
            });
        });

        d3.select(this).selectAll("path")
            .data(data)
            .enter().append('path')
                .attr("class", "line")
                .style('stroke', 'black')
                .attr("d", function(layer) {
                    console.log(layer)
                    return factory.ringLayout(layer)(layer);
                });
    });
    return factory;
};
