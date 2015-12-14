var tempGrad = function(svg, tlow, thigh, scale, inner, outer) {
    var grad = svg.append('radialGradient')
        .attr('id', 'g1')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('cx', 0).attr('cy', 0)
        .attr('r', scale(thigh));

    var stopOffset = function(temp) {
        return (scale(temp) - inner) / (outer - inner);
    };

    var bands = [
        {temp: -100, color: 'blue'},
        {temp: -20, color: 'blue'},
        {temp: -20, color: 'lightblue'},
        {temp: 0, color: 'lightblue'},
        {temp: 0, color: 'orange'},
        {temp: 20, color: 'orange'},
        {temp: 20, color: 'red'},
        {temp: 100, color: 'red'}
    ];

    grad.selectAll('stop')
        .data(bands)
        .enter()
        .append('stop')
            .attr('offset', function(band) {
                return stopOffset(band.temp);
            })
            .attr('stop-color', function(band) {
                return band.color;
            });
}
