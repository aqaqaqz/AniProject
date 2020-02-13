var srt2vtt = require("../index")

var subtitles = "./test/subtitles.srt"

srt2vtt(subtitles, function(err, result){
    if(err) console.log("Error happened :(")
    console.log(JSON.stringify(result))
})

