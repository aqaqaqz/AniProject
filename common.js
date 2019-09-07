var multer = require('multer');
var fs = require('fs');

const certKey = fs.readFileSync(new URL('file:///opt/dev/js/git/AniProject/secret/certKey')).toString('utf8').replace('\n', '');
const domain = fs.readFileSync(new URL('file:///opt/dev/js/git/AniProject/secret/domain')).toString('utf8').replace('\n', '');
const defPath = '/media/lsh/MGTEC/download/';
var smi2vtt = require('smi2vtt');
var srt2vtt = require('srt2vtt2');

var subList = ['smi', 'srt'];

var getTitle = function(){
	var reg = /[\d]{4}/;
	var qutList = fs.readdirSync(defPath, 'utf8');
	var aniTitle = {};
	
	for( var idx in qutList){
		var qut = qutList[idx];
		if(!reg.test(qut)) continue;
		
		var year = reg.exec(qut);
		if(aniTitle[year] == undefined)
			aniTitle[year] = [qut];
		else
			aniTitle[year].push(qut);
		/*
		if(reg.test(qut)){
			aniTitle[qut] = fs.readdirSync(defPath+qut, 'utf-8');
		}
		*/
	}
	
	return aniTitle;
};

module.exports = {
	getCertKey : function(){
		return certKey;
	},
	getDomain : function(){
		return domain;
	},
	getDefPath : function(){
		return defPath;
	},
	getExistSubtitle : function(path, name){
		var result = [];
		for(var i=0;i<subList.length;i++){
			var subPath = path.replace('.mp4', '.'+subList[i]);
			if(fs.existsSync(subPath)) result.push({type:subList[i], path:subPath});
		}
		return result;
	},
	getSubList : function(){
		return subList;
	},
	checkSubtitleType : function(file){
		for(var i=0;i<subList.length;i++){
			var exec = new RegExp("." + subList[i] + "$");
			if(exec.test(file.originalname)) return ("."+subList[i]);
		}
		return ".troll";
	},
	getData : function(){
		var data = {
			maxWidth : 1320,
			aniTitle : getTitle(),
			domain : domain
		}

		return data;
	},
	checkCert : function(req, res){
		if(req.cookies.certKeyYn != 'TRUE'){
			res.render('certPage');
			 return false;
		}

		return true;
	}
}
