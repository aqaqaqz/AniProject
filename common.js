var multer = require('multer');
var fs = require('fs');

const certKey = fs.readFileSync(new URL('file:///opt/dev/js/git/AniProject/secret/certKey')).toString('utf8').replace('\n', '');
const domain = fs.readFileSync(new URL('file:///opt/dev/js/git/AniProject/secret/domain')).toString('utf8').replace('\n', '');
const defPath = '/media/lsh/MGTEC/download/';
var smi2vtt = require('smi2vtt');
var srt2vtt = require('srt2vtt2');

var subList = ['smi', 'srt', 'ass'];

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

var getExistSubtitle = function(path){
    var result = [];
    for(var i=0;i<subList.length;i++){
        var subPath = path.replace(path.substr(path.length-4), '.'+subList[i]);
        if(fs.existsSync(subPath)) result.push({type:subList[i], path:subPath});
    }
    return result;
};

var getFileList = function(path){
    var aniList = [];
    var tempList = fs.readdirSync(path, {encoding:'utf-8', withFileTypes : true});

    tempList.sort((a, b)=>{
        var dirA = a.isDirectory();
        var dirB = b.isDirectory();
        if(!(dirA&&dirB) && (dirA||dirB)){
            if(dirA) return -1;
            return 1;
        }
        return a.name>b.name?1:-1;
    });

    var exec = /.mp4$/;
    var exec2 = /.mkv$/;
    for(var i=0;i<tempList.length;i++){
        if(exec.test(tempList[i].name) || exec2.test(tempList[i].name) || tempList[i].isDirectory()){
            var ani = {};
            ani.name = tempList[i].name;
            ani.subYn = getExistSubtitle(path+'/'+ani.name).length>0;
            ani.fileType = (tempList[i].isDirectory()?'D':'F');
            aniList.push(ani);
        }
    }

    return aniList;
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
	getExistSubtitle : function(path){
		return getExistSubtitle(path);
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
    getFileList : function(path){
        return getFileList(path);
    },
    getShortCutLink : function(path){
        var result = {pre : "" , next : ""};
        var pathArr = path.split("/");
        var lastPath = pathArr.pop();
        var prePath = pathArr.reduce( (pre, val, idx, pathArr) =>{
            return (pre + val + "/");
        }, "");
        
        var list = getFileList(prePath);
        for(var i=0;i<list.length;i++){
            if(list[i].name == lastPath){
                if(i>0 && list[i-1].fileType!="D") result.pre = prePath.replace(defPath,'') + list[i-1].name;
                if(i+1 != list.length) result.next = prePath.replace(defPath, '') + list[i+1].name;
                break;
            }
        }

        return result;
    },
	checkCert : function(req, res){
		if(req.cookies.certKeyYn != 'TRUE'){
			res.render('certPage');
			 return false;
		}

		return true;
	}
}
