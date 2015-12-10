var monthGrid = function(svg, inner, outer) {
    var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        .reduce(function(acc, days) {
            acc.push(_.last(acc) + days);
            return acc;
        }, [0])
    var deg = d3.scale.linear()
        .domain([0, _.last(months)])
        .range([-90, 270]);
    var ga = svg.append("g")
        .attr("class", "a axis")
      .selectAll("g")
        .data(months.slice(0, -1))
      .enter().append("g")
        .attr("transform", function(d) { return "rotate(" + deg(d) + ")"; });
    ga.append("line")
        .attr("x1", inner)
        .attr("x2", outer)
        .attr('stroke', 'black')
        .attr('opacity', function(dummy, i) {
            return (i + 1) % 3 === 0? .3: .15;
        });
}
