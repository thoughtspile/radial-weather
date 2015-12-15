donuts.ringOrders = function() {
    var factory = donuts.base(function(data) {
        var ringFactory = donuts.ringMean()
            .inner(factory.inner())
            .outer(factory.outer());
        ringFactory.globals.tlow = d3.min(data, _.property('temp'));
        ringFactory.globals.thigh = d3.max(data, _.property('temp'));

        data = binOrderDaily(data);

        // this is useful
        // return r(pt.temp.length > i? pt.temp[i]: _.last(pt.temp));

        var layers = d3.select(this).selectAll('g')
            .data(data)
            .enter()
                .append('g')
                .call(ringFactory);
    });
    return factory;
};
