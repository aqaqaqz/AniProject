var express = require('express');
var multer = require('multer');
var pug = require('pug');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var https = require('https');
var cors = require('cors');

var smi2vtt = require('smi2vtt');
var srt2vtt = require('srt2vtt2');
var ass2vtt = require('ass-to-vtt');

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


var favicon = require('serve-favicon');
app.use(favicon('/opt/dev/js/git/AniProject/views/favicon/f.ico'));


/*
var whiteList = ['*'];
var corsOptions = {
	origin : function(origin, callback){
		var isWhitelisted = whiteList.indexOf(origin) != -1;
		callback(null, isWhitelisted);
	},
	credentials : true
}
app.use(cors(corsOptions));
*/
app.use(cors());

const port = 43123;

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
	if(fs.lstatSync(fullPath).isDirectory()){
		if(path == "torDown" || path == "temp") data['moveYn'] = 'Y';
		else data['moveYn'] = 'N';

		data.aniList = common.getFileList(fullPath);

		res.render('aniTitleInfo', data);
		return;
	}else{
		var ani = {};
		ani.subList = common.getExistSubtitle(fullPath);
		ani.shortCutLink = common.getShortCutLink(fullPath);
		data.ani = ani;
		res.render('aniPlayer', data);
		return;
	}
});

app.get('/certKeyCheck', (req, res)=>{
	var data;
	var iCertKey = req.query.certKey;

	if(iCertKey == common.getCertKey()){
		res.cookie('certKeyYn', 'TRUE');
		var url = req.cookies.preUrl;
		res.clearCookie('preUrl');

		if(url!=undefined)
			res.redirect(url);
		else
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
			var temp = location[location.length-1];
			temp = temp.substr(temp.length-4);
			cb(null, location[location.length-1].replace(temp, common.checkSubtitleType(file)));
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
	}else if(type=='ass' && fs.existsSync(path)){
		fs.createReadStream(path)
			.pipe(ass2vtt())
			.pipe(res);
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
				var sub = title.replace('.mp4', '.'+subList[j]);
				if(fs.existsSync(oriPath+sub))
					fs.renameSync(oriPath+sub, movePath+sub);
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

var dirList = [];
app.get('/listUpdate', (req, res)=>{
	dirList = [];

	var reg = /[\d]{4}-[\d]/;
	var dir = fs.readdirSync(common.getDefPath(), 'utf8');
	for(var idx in dir){
		var name = dir[idx];
		if(reg.test(name) || name=="etc"){
			dirList.push(searchLow(common.getDefPath(), "", name));
		}
	}

	res.send(dirList);
});
var searchLow = function(defPath, prePath, name){
	var t = {};
	t.name = name;
	t.low = [];
	t.path = prePath + name;
	t.isDir = fs.lstatSync(defPath + t.path).isDirectory();
	if(!t.isDir) return t;
	t.path += "/";

	var list = fs.readdirSync(defPath+t.path, {encoding:'utf-8', withFileTypes : true});
	for(var i in list)
		t.low.push(searchLow(defPath, t.path, list[i].name));

	return t;
};

app.get('/search', (req, res)=>{
	if(!common.checkCert(req, res)) return;

	var data = common.getData();

	var aniList = searchAniList(req.query.keyword, dirList);
	aniList.sort((a, b)=>{
		var dirA = a.isDir;
		var dirB = b.isDir;
		if(!(dirA&&dirB) && (dirA||dirB)){
			if(dirA) return -1;
			return 1;
		}
		return a.name>b.name?1:-1;
	});

	for(var i=0;i<aniList.length;i++){
		aniList[i].subYn = common.getExistSubtitle(common.getDefPath() + aniList[i].path).length>0;
		aniList[i].fileType = (aniList[i].isDir?'D':'F');
	};
	data.aniList = aniList;

	res.render('searchAniInfo', data);
	return;
});
var searchAniList = (keyword, dir)=>{
	var exec1 = /.mp4$/;
	var exec2 = /.mkv$/;

	var result = [];
	if(dir.length == 0) return result;

	for(var i in dir){
		if(dir[i].name.indexOf(keyword)>-1 && (dir[i].isDir || exec1.test(dir[i].name) || exec2.test(dir[i].name))){
			var temp = {};
			temp.path = dir[i].path;
			temp.name = dir[i].name;
			temp.isDir = dir[i].isDir;
			result.push(temp);
		}else if(dir[i].isDir){
			var temp = searchAniList(keyword, dir[i].low);
			for(var j in temp)
				result.push(temp[j]);
		}
	}

	return result;
};

app.get('/dotji', (req, res)=>{
	res.render('dotji');
});


//app.listen(80, ()=>{
//	console.log(`Connected : 80`);
//});


var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/lshCert/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/lshCert/cert.pem')
};

https.createServer(options, app).listen(port);
