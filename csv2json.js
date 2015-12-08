var fs = require('fs');
var _ = require('lodash');
var mean = arr => _.sum(arr) / _.size(arr);

var csv = fs.readFileSync(__dirname + '\\msk-vdnh.csv') + '';
var dateRE = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):\d{2}$/;
var data = csv.split('\n')
    .map(str => {
        var rec = str.split(';').map(s => s.substring(1, s.length - 1));
        var time = rec[0].replace(dateRE, '$3-$2-$1T$4:00')
        if (Math.random() < .001) console.log((rec[10] || '').match(/\d+/))
        return {
            time: new Date(time),
            temp: parseFloat(rec[1]),
            wet: parseFloat(rec[5]),
            windSpeed: parseFloat((rec[7] || '').match(/\d+/)),
            clouds: mean(((rec[10] || '').match(/\d+/g) || [])
                .slice(1)
                .map(s => parseFloat(s)))
        }
    })
    .filter(rec => !isNaN(rec.temp) && rec.time)
fs.writeFileSync(__dirname + '\\msk.json', 'var mskt = ' + JSON.stringify(data, null, '\t'));
