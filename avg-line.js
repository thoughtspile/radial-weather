donuts.ringMean = function() {
    var factory = donuts.base(function(data) {
        data = binMeanDaily(data);
        var plot = donuts.ringLine()
            .inner(factory.inner()).outer(factory.outer());
        d3.select(this).datum(data).call(plot);
    });
    return factory;
};
