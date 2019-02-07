var express = require('express');
var pug = require('pug');
var smi2vtt = require('smi2vtt');
var srt2vtt = require('srt2vtt2');
var fs = require('fs');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var app = express();

app.locals.pretty = true;
app.set('view engine', 'pug');
app.set('views', './views');

app.use(cookieParser());
app.use(express.static('views'));
app.use(express.static('img'));
app.use(express.static('file'));
app.use(express.static('/media/lsh/MGTEC/download'));

const port = 43123;
const certKey = fs.readFileSync(new URL('file:///opt/dev/js/git/AniProject/secret/certKey')).toString('utf8').replace('\n', '');
const domain = fs.readFileSync(new URL('file:///opt/dev/js/git/AniProject/secret/domain')).toString('utf8').replace('\n', '');
const aniDefPath = '/media/lsh/MGTEC/download/';

var upload = multer({
	storage : multer.diskStorage({
		destination : function (req, file, cb){
			cb(null, aniDefPath+req.query.aniPath);
		},
		filename : function(req, file, cb){
			var type = '.smi';
			var exec1 = /.srt$/;
			var exec2 = /.smi$/;
			if(exec1.test(file.originalname)) type = '.srt';
			else if(exec2.test(file.originalname)) type = '.smi';
			else type = '.troll';
			cb(null, req.query.aniName.replace('.mp4', type));
		}
	})
});

var getAniTitle = function(){
        var reg = /[\d]{4}-[\d]/;
        var qutList = fs.readdirSync(aniDefPath, 'utf8');
        var aniTitle = {};
        for( var idx in qutList){
                var qut = qutList[idx];
                if(reg.test(qut)){
                        aniTitle[qut] = fs.readdirSync(aniDefPath+qut, 'utf-8');
                }
        }

        return aniTitle;
}

var getCommonData = function(){
	var data = {
		maxWidth : 1320,
		aniTitle : getAniTitle(),
		domain : domain
	}

	return data;
}

//home
app.get('/', (req, res)=>{
	if(req.cookies.certKeyYn != 'TRUE'){
		res.render('certPage');
		return;
	}
	var data = getCommonData();
	res.render('main', data);
});
//ani title info
app.get('/aniTitleInfo', (req, res)=>{
	if(req.cookies.certKeyYn != 'TRUE'){
                res.render('certPage');
                return;
        }
	var path = req.query.path;
	var data = getCommonData();
	data['path'] = path;

	var exec = /.mp4$/;
	var aniList = [];
	var subList = [];
	var fileType = [];
	var filePath = [];
	tempAniList = fs.readdirSync(aniDefPath+path, {encoding:'utf-8', withFileTypes : true});
	for(var i=0;i<tempAniList.length;i++){
		if(exec.test(tempAniList[i].name) || tempAniList[i].isDirectory()){
			aniList.push(tempAniList[i].name);
			var smiPath = aniDefPath+path+'/';
			subList.push(fs.existsSync(smiPath+tempAniList[i].name.replace('.mp4', '.smi')) || fs.existsSync(smiPath+tempAniList[i].name.replace('.mp4', '.srt')));
			fileType.push(tempAniList[i].isDirectory()?'D':'F');
		}
	}
	data['aniList'] = aniList;
	data['subList'] = subList;
	data['fileType'] = fileType;
	res.render('aniTitleInfo', data);
});
//ani player
app.get('/aniPlayer', (req, res)=>{
	if(req.cookies.certKeyYn != 'TRUE'){
                res.render('certPage');
                return;
        }
	var data = getCommonData();
	data['path'] = req.query.path;
	data['aniName'] = req.query.aniName;
	data['smiExist'] = fs.existsSync(aniDefPath+data['path']+'/'+data['aniName'].replace('.mp4', '.smi'));
 	data['srtExist'] = fs.existsSync(aniDefPath+data['path']+'/'+data['aniName'].replace('.mp4', '.srt'));
	res.render('aniPlayer', data);
});

//convert smi to vtt
app.get('/smi', (req, res)=> {
	if(fs.existsSync(req.query.smiPath)){
		smi2vtt(req.query.smiPath).then( data=> {
			res.set('Content-Type', 'text/vtt');
			res.send(data);
		});
	}else{
		res.send({});
	}
});
//convert srt to vtt
app.get('/srt', (req, res)=>{
	if(fs.existsSync(req.query.srtPath)){
		srt2vtt(req.query.srtPath, function(err, data){
			if(!err) res.send(fs.readFileSync(data.vtt));
		})
        }else{
                res.send({});
        }

});

//smi upload...
app.post('/smiUpload', upload.single('smiFile'), (req, res)=>{
	var data = getCommonData();
        data['path'] = req.query.aniPath;
        data['aniName'] = req.query.aniName;
	data['smiExist'] = fs.existsSync(aniDefPath+data['aniPath']+'/'+data['aniName'].replace('.mp4', '.smi'));
        data['srtExist'] = fs.existsSync(aniDefPath+data['aniPath']+'/'+data['aniName'].replace('.mp4', '.srt'));

        res.render('aniPlayer', data);

});

//certificate
app.get('/cert', (req, res)=>{
	res.render('certPage');
});
app.get('/certKeyCheck', (req, res)=>{
	var data;
	var iCertKey = req.query.certKey;

	if(iCertKey == certKey){
		res.cookie('certKeyYn', 'TRUE');
		data = getCommonData();
		res.render('main', data);
	}else{
		data = { result : 'worng certificate key...' };
		res.render('certPage', data);
	}
});

app.get('/dotji', (req, res)=>{
	res.render('dotji');
});


//test
app.get('/test', (req, res)=>{
	res.send("Test Page");
});


app.listen(port, ()=>{
	console.log(`Connected : ${port}!`);
});
