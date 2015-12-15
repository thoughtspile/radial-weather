var period = 365 * 24 * 3600000;
var leapPrefix = '2012-';


var unnest = function(rec) {
    return {
        time: (rec.key),
        temp: rec.values
    };
};


var movingAvg = function(n) {
    return function (points) {
        points = points.map(function(each, index, array) {
            var to = index + n - 1;
            var subSeq, sum;
            if (to < points.length) {
                subSeq = array.slice(index, to + 1);
                sum = subSeq.reduce(function(a,b) {
                    return [a[0] + b[0], a[1] + b[1]];
                });
                return sum.map(function(each) { return each / n; });
            }
            return undefined;
        });
        points = points.filter(function(each) { return typeof each !== 'undefined' })
        // Note that one could re-interpolate the points
        // to form a basis curve (I think...)
        return points.join("L");
    }
}

var dailyMean = function(data) {
    return d3.nest()
        .key(function(rec) {
            return rec.time.substr(0, 10);
        })
        .rollup(function(times) {
            return d3.mean(times, function(rec) { return rec.temp || 0 });
        })
        .entries(data)
        .map(unnest);
}


var compoundSegments = function(data, segFn) {
    return data.reduce(function(segmented, pt, i) {
        var last = _.last(_.last(segmented));
        if (!last || segFn(last.temp) != segFn(pt.temp)) {
            if (_.last(segmented))
                _.last(segmented).push(pt);
            segmented.push([]);
        }
        _.last(segmented).push(pt);
        return segmented;
    }, []);
}

var atomicSegments = function(data) {
    if (data.length == 0)
        return [];
    return data.slice(1).reduce(function(segmented, pt, i) {
        _.last(segmented).push(pt)
        segmented.push([pt]);
        return segmented;
    }, [[data[0]]]);
}

var sharpSegments = function(data, segFn) {
    var temp = compoundSegments(data, segFn);
    temp.slice(1).forEach(function(segment, i) {
        var prevSeg = temp[i];
        var range = _.map(prevSeg.slice(-2), 'temp');
        while (Math.abs(range[1] - range[0]) > .1) {
            var mid = (range[1] + range[0]) / 2;
            range[segFn(mid) == segFn(range[0])? 0: 1] = mid;
        }

        _.last(prevSeg).temp = range[0];
        segment[0].temp = range[1];
    });
    return temp;
};


var yearless = d3.nest().key(function(rec) {
    return leapPrefix + rec.time.substr(5, 10);
});

var binMeanDaily = function(data) {
    return yearless
        .rollup(function(dayInYrs) {
            return d3.mean(dayInYrs, _.property('temp'));
        })
        .entries(data)
        .map(unnest);
}

var binCatsDaily = function(data, segFn, cats) {
    data = yearless
        .rollup(function(day) {
            var counts = _.countBy(day.map(function(rec) {
                return segFn(rec.temp);
            }));
            var distr = {};
            cats.forEach(function(cat, i) {
                distr[cat] = counts[cat] / day.length || 0;
                distr[cat] += distr[cats[i - 1]] || 0;
            });
            return distr;
        })
        .entries(data);
    return cats.map(function(cat) {
        return {
            color: cat,
            data: data.map(function(rec) {
                return {
                    time: rec.key,
                    temp: rec.values[cat]
                };
            })
        };
    });
}

var binOrderDaily = function(data) {
    data = yearless
        .rollup(function(dayInYrs) {
            return _(dayInYrs).map('temp').sortBy().value();
        })
        .entries(data);

    // remove feb 29
    _.pull(data, _.min(data, 'temp.length'));

    var bandCount = d3.max(data, _.property('values.length'));

    // restructure
    return _.range(bandCount).map(function(cat) {
        return data.map(function(rec) {
            return {
                time: rec.key,
                temp: rec.values[cat]
            };
        });
    });
}


var normalizeTime = function(data, scaledPeriod) {
    scaledPeriod = scaledPeriod || 1;
    var times = d3.extent(data, function(rec) {
        return new Date(rec.time).getTime();
    });
    var periods = (times[1] - times[0]) / period;
    var scale = function(time) {
        return (new Date(time).getTime() - times[0]) / (times[1] - times[0]) * scaledPeriod * periods;
    };
    scale.domain = times.slice();
    scale.range = [0, scaledPeriod * periods];
    return scale;
}
