var period = 365 * 24 * 3600000;
var oneDay = 1000 * 60 * 60 * 24;
var leapPrefix = '2012-';
var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    .reduce(function(acc, days) {
        acc.push(_.last(acc) + days);
        return acc;
    }, [0]);


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
    data = d3.nest()
        .key(function(rec) {
            return rec.time.substr(0, 10);
        })
        .rollup(function(times) {
            return d3.mean(times, function(rec) { return rec.temp || 0 });
        })
        .entries(data)
        .map(unnest);
    return data;
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


var pad0 = function(str, l) {
    if (!(str instanceof String))
        str = String(str);
    while (str.length < l)
        str = '0' + str;
    return str;
}

var bin = function(i) {
    return d3.nest().key(function(rec) {
        var mon = parseInt(rec.time.substr(5, 2));
        var day = parseInt(rec.time.substr(8, 2));
        var nDay = months[mon - 1] + day;
        var sparseNDay = i * Math.floor(nDay / i);
        var sparseMon = _.findIndex(months, function(days, i) {
            return months[i + 1] > sparseNDay || i == 12;
        });
        var sparseDay = sparseNDay - months[sparseMon] + 1;
        if (isNaN(sparseDay))
            console.log(rec, sparseMon, sparseNDay)
        return leapPrefix +
            pad0(sparseMon + 1, 2) + '-' +
            pad0(sparseDay, 2);
    })
    .sortKeys(d3.ascending);
};

var yearless = bin(1);


var binMeanDaily = function(data) {
    return bin(window.binSize)
        .rollup(function(dayInYrs) {
            return d3.mean(dayInYrs, _.property('temp'));
        })
        .entries(data)
        .map(unnest);
}

var binCatsDaily = function(data, segFn, cats) {
    data = bin(window.binSize)
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
            data: _.sortBy(data.map(function(rec) {
                return {
                    time: rec.key,
                    temp: rec.values[cat]
                };
            }, 'time'))
        };
    });
}

var binOrderDaily = function(data) {
    data = bin(window.binSize)
        .rollup(function(dayInYrs) {
            return _(dayInYrs).map('temp').sortBy().value();
        })
        .entries(data);
    data = _.sortBy(data, 'key')
    console.log(data)

    // remove feb 29
    // _.pull(data, _.min(data, 'temp.length'));

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


var stepMeans = function(data, n) {
    return _.chunk(data, n).map(function(chunk) {
        return {
            time: chunk[0].time,
            temp: d3.mean(chunk, _.property('temp'))
        };
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
