var iconv = require('iconv-lite');
var captions = require('node-captions');
var fs = require('fs');

var win = {}

module.exports = function (data, cb) { // Converts .srt's to .vtt's
    try {
        var srt = data;
        var vtt = srt.replace('.srt', '.vtt');
        var lang = data.language;
        var encoding = 'utf8';
        iconv.extendNodeEncodings();
        var langInfo = {};
        if (langInfo.encoding !== undefined) {
            encoding = langInfo.encoding[0].replace('-', '');
        }
        captions.srt.read(srt, {
            encoding: encoding
        }, function (err, data) {
            if (err) {
                return cb(err, null);
            }
            try {
                fs.writeFile(vtt, captions.vtt.generate(captions.srt.toJSON(data)), encoding, function (err) {
                    if (err) {
                        return cb(err, null);
                    } else {
                        return cb(null, {
                            vtt: vtt,
                            encoding: encoding
                        });
                    }
                });
            } catch (e) {
                console.log('Error writing vtt');
            }
        });
    } catch (e) {
        console.log('error parsing subtitles');
        return cb(null, {
            vtt: '',
            encoding: 'utf8'
        });
    }

}

