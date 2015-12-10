var mapElStyle = window.getComputedStyle(document.getElementById('map'));
var w = parseFloat(mapElStyle.width);
var h = parseFloat(mapElStyle.height);

var svg = d3.select("#map").append("svg")
    .attr("width", w)
    .attr("height", h)
    .append('g')
    .attr('transform', 'translate(' + w/2 + ',' + h/2 + ')');
