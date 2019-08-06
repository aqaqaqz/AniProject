var express = require('express');
var multer = require('multer');
var pug = require('pug');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var smi2vtt = require('smi2vtt');
var srt2vtt = require('srt2vtt2');

var fs = require('fs');
var common = require('./common.js');

var {PythonShell} = require('python-shell');

var app = express();

app.locals.pretty = true;
app.set('view engine', 'pug');
app.set('views', './views');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static('views'));
app.use(express.static('img'));
app.use(express.static('file'));
app.use(express.static('/media/lsh/MGTEC/download'));

const port = 43123;

/*
	검색기능
	(대상폴더는 공통폴더 + 하드코딩 폴더)
	(폴더명에 검색어가 포함되어 있으면 그 위치추가시키고 종료)
*/

//home
app.get('/', (req, res)=>{
	if(!common.checkCert(req, res)) return;
	var data = common.getData();
	res.render('main', data);
});

app.get('/moveToPath', (req, res)=>{
	if(!common.checkCert(req, res)) return;

	var path = req.query.path;
	var fullPath = common.getDefPath() + path;

	if(!fs.existsSync(fullPath)){
		return;
	}

	var data = common.getData();
	data.path = path;
	var aniList = [];
	if(fs.lstatSync(fullPath).isDirectory()){
		if(path == "torDown" || path == "temp") data['moveYn'] = 'Y';
		else data['moveYn'] = 'N';

		tempAniList = fs.readdirSync(fullPath, {encoding:'utf-8', withFileTypes : true});

		tempAniList.sort((a, b)=>{
			var dirA = a.isDirectory();
			var dirB = b.isDirectory();
			if(!(dirA&&dirB) && (dirA||dirB)){
				if(dirA) return -1;
				return 1;
			}
			return a.name>b.name?1:-1;
		});

		var exec = /.mp4$/;
		for(var i=0;i<tempAniList.length;i++){
			if(exec.test(tempAniList[i].name) || tempAniList[i].isDirectory()){
				var ani = {};
				ani.name = tempAniList[i].name;
				ani.subYn = common.getExistSubtitle(fullPath+'/'+ani.name).length>0;
				ani.fileType = (tempAniList[i].isDirectory()?'D':'F');
				aniList.push(ani);
			}
		}
		data.aniList = aniList;

		res.render('aniTitleInfo', data);
		return;
	}else{
		var ani = {};
		ani.subList = common.getExistSubtitle(fullPath);
		data.ani = ani;
		res.render('aniPlayer', data);
		return;
	}
});

app.get('/search', (req, res)=>{
	if(!common.checkCert(req, res)) return;

	var data = common.getData();

	var aniList = [];

	var reg = /[\d]{4}-[\d]/;
    var dirList = fs.readdirSync(common.getDefPath(), 'utf8');
    for( var idx in dirList){
		var dirName = dirList[idx];
		if(reg.test(dirName) || dirName=="etc"){
			var tempList = getSearchAniList(req.query.keyword, common.getDefPath()+dirName);
			for(var idx in tempList){
				aniList.push(tempList[idx]);
			}
		}
	}
	
	aniList.sort((a, b)=>{
		var dirA = a.isDirectory();
		var dirB = b.isDirectory();
		if(!(dirA&&dirB) && (dirA||dirB)){
			if(dirA) return -1;
			return 1;
		}
		return a.name>b.name?1:-1;
	});

	for(var i=0;i<aniList.length;i++){
		aniList[i].subYn = common.getExistSubtitle(aniList[i].path+'/'+aniList[i].name).length>0;
		aniList[i].fileType = (aniList[i].isDirectory()?'D':'F');
	}
	data.aniList = aniList;

	res.render('searchAniInfo', data);
	return;
});
var getSearchAniList = (keyword, path)=>{
	//name, isDirectory(), path
	var exec = /.mp4$/;
	path += '/';
	var list = fs.readdirSync(path, {encoding:'utf-8', withFileTypes : true});
	var result = [];
	for(var i in list){
		if(list[i].name.indexOf(keyword) >= 0 && (list[i].isDirectory() || exec.test(list[i].name))){
			list[i].path = path.replace(common.getDefPath(), "");
			result.push(list[i]);
		}else if(list[i].isDirectory()){
			var temp = getSearchAniList(keyword, path+list[i].name);
			for(var j in temp)
				result.push(temp[j]);
		}
	}
	return result;
}


app.get('/certKeyCheck', (req, res)=>{
	var data;
	var iCertKey = req.query.certKey;

	if(iCertKey == common.getCertKey()){
		res.cookie('certKeyYn', 'TRUE');
		res.render('main', common.getData());
	}else{
		data = { result : 'worng certificate key...' };
		res.render('certPage', data);
	}
});

var upload = multer({
	storage : multer.diskStorage({
		destination : function (req, file, cb){
			var path = "";
			var location = req.query.path.split('/');
			for(var i=0;i<location.length-1;i++) path += (location[i]+'/');
			cb(null, common.getDefPath()+path);
		},
		filename : function(req, file, cb){
			var location = req.query.path.split('/');
			cb(null, location[location.length-1].replace('.mp4', common.checkSubtitleType(file)));
		}
	})
});
app.post('/subUpload', upload.single('subFile'), (req, res)=>{
	res.send('sub upload');}
);

app.get('/changeToVtt', (req, res)=>{
	var path = req.query.path;
	var type = req.query.type;
	
	if(type=='smi' && fs.existsSync(path)){
		smi2vtt(path).then( data=> {
			res.set('Content-Type', 'text/vtt');
			res.send(data);
		});
	}else if(type=='srt' && fs.existsSync(path)){
		srt2vtt(path, function(err, data){
			if(!err) res.send(fs.readFileSync(data.vtt));
		})
	}else
		res.send({});
});

app.get('/moveFile', (req, res)=>{
	var moveList = req.query.moveList;
	var oriPath = common.getDefPath() + req.query.oriPath;
	var movePath = common.getDefPath() + req.query.movePath;
	var type = req.query.type;

	var subList = common.getSubList();

	for(var i=0;i<moveList.length;i++){
		var title = moveList[i];
		fs.renameSync(oriPath+title, movePath+title);
		if(type == "d"){
			for(var j=0;j<subList.length;j++){
				var sub = title.replace('.mp4', subList[j]);
				if(fs.existsSync(oriPath+sub))
					fs.renameSync(oriPath+smi, movePath+smi);
			}
		}
	};

	if(type == 'd'){
		PythonShell.run(common.getDefPath()+'folder.py', null, (err)=>{
			if(err){ throw err; }
		});
	}

	res.send({result : true});
});

app.get('/dotji', (req, res)=>{
	res.render('dotji');
});


app.listen(port, ()=>{
	console.log(`Connected : ${port}!`);
});

