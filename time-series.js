var period = 365 * 24 * 3600000;
var dateFmt = d3.time.format("%Y-%m-%d");


var unnest = function(rec) {
    return {
        time: rec.key,
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
        .map(function(rec) {
            return {
                time: rec.key,
                temp: rec.values
            };
        });
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

var binMeanDaily = function(data, segFn) {
    return d3.nest()
        .key(function(rec) {
            return rec.time.substr(5, 10);
        })
        .rollup(function(dayInYrs) {
            return d3.mean(dayInYrs, function(rec) {
                return rec.temp || 0;
            });
        })
        .entries(mskt)
        .map(unnest);
}

var binCatsDaily = function(data, segFn) {
    return d3.nest()
        .key(function(rec) {
            return rec.time.substr(5, 10);
        })
        .rollup(function(dayInYrs) {
            return dayInYrs.map(
                function(rec) {return segFn(rec.temp);
            });
        })
        .entries(mskt)
        .map(unnest);
}
