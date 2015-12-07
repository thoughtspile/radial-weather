var fs = require('fs');

var csv = fs.readFileSync(__dirname + '\\msk-vdnh.csv') + '';
var dateRE = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):\d{2}$/;
var data = csv.split('\n')
    .map(str => {
        var rec = str.split(';').map(s => s.substring(1, s.length - 1));
        var time = rec[0].replace(dateRE, '$3-$2-$1T$4:00')
        return {
            time: new Date(time),
            temp: parseFloat(rec[1])
        }
    });
fs.writeFileSync(__dirname + '\\msk.json', 'var mskt = ' + JSON.stringify(data, null, '\t'));
