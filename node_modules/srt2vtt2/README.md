srt2vtt converter
=================

Converts .srt subtitles into vtt format

## How to use it:

``` javascript
var srt2vtt = require("srt2vtt2")

var subtitles = "./test/subtitles.srt"

srt2vtt(subtitles, function(err, result){
    if(err) console.log("Error happened :(")
    console.log(JSON.stringify(result))
})
```

## Installation 

With [npm](http://npmjs.org):

[![NPM](https://nodei.co/npm/srt2vtt2.png?downloads=true)](https://nodei.co/npm/srt2vtt2/)

## Kudos

Kudos for the original authors of this module, the [PopcornTime.io](http://popcorntime.io/) developers.
