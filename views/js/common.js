$(document).ready(function(){
	var initChromeCast = function(){
		if($("#aniPlayer").length == 0) return;

		window['__onGCastApiAvailable'] = function(isAvailable) {
			if (isAvailable) {
				initializeCastApi();
			}
		};

		initializeCastApi = function() {
			cast.framework.CastContext.getInstance().setOptions({
				receiverApplicationId : chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
				//receiverApplicationId : "CC1AD845"
			});
		};
	}

	var initAniPlayer = function(){
		if($("#aniPlayer").length == 0) return;
		document.getElementById("player").onseeked = function(){
			if(cast.framework.CastContext.getInstance().getCurrentSession()){
				var mediaSession = cast.framework.CastContext.getInstance().getCurrentSession().getMediaSession();
				var seekReq = new chrome.cast.media.SeekRequest();
				seekReq.currentTime = $("#player")[0].currentTime;
				mediaSession.seek(
					seekReq
					,function(){
						console.log('success');
					},function(e){
						console.log(e);
					}
				);
			}
		};
	}

	var initGnb = function(){
		var gnbList = $(".qutNm");
		var pos = false;
		gnbList.mouseover(function(){
			$(".qutNm div").hide();
 		   	$(this).find("div").show();
		}).mouseleave(function(){
			$(".qutNm div").hide();
		});


		$.each(gnbList, function(idx, gnb){
			var maxLen = 0;
			var title = $(gnb).find(".titleList div");
			$.each(title, function(idx, val){
				maxLen = Math.max(maxLen, $(val).actual('width'));
			});
			title.css("width", maxLen+20+"px");
			$(gnb).find(".titleList").css("width", maxLen*2 + 50+"px");
		});
	};


	var init = function(){
		initGnb();
		initChromeCast();
		initAniPlayer();
	};
	init();

	//type : 'd' -> 폴더정리
	//type : 't' -> temp 폴더로
	fnSelectMove = function(oriPath){
		var type = prompt("intput type...", "");
		if(type!='t' && type!='d'){
			alert("can not use this type...");
			return;
		}
		fnMove(oriPath, type);
	};

	var fnMove = function(oriPath, type){
		var temp = fnMove;
		fnMove = function(){ console.log("작업중입니다."); return; };

		var selList = $("input.moveInput");
		var moveList = [];
		var movePath = 'temp/';
		if(type == 'd') movePath = '';

		$.each(selList, function(idx, val){
			if($(val).prop("checked"))
			moveList.push($(val).parent().parent().find("td").eq(0).text().replace(/.*aniName=/gi, ""));
		});
		if(moveList.length == 0) return;

		$.ajax({
			url : '/moveFile',
			type : 'GET',
			dataType : 'json',
			data : {
				oriPath : oriPath,
				movePath : movePath,
				moveList : moveList,
				type : type
			},
			success : function(d){
				if(d.result)
					location.reload(true);
			},
			error : function(e){
				console.log(e);
			}
		});
	}

	fnSubUpload = function(){
		var formData = new FormData($("form")[0]);

		$.ajax({
			url : '/subUpload?path='+formData.get('path'),
			processData: false,
			contentType: false,
			type:'POST',
			data:formData,
			success:function(d){
				location.reload();
			},
			error:function(e){
				alert(e);
			}
		});
	};

	$("#searchBtn").click(function(){
		window.location.href = '/search?keyword='+encodeURIComponent($("#keyword").val());
	});

	fnChromeCastBtn = function(){
		if(cast.framework.CastContext.getInstance().getCurrentSession()){
			if (confirm("기존의 연결을 종료하시겠습니까?") == true)
				cast.framework.CastContext.getInstance().getCurrentSession().endSession(true);
			else
				return;
		}

		cast.framework.CastContext.getInstance().requestSession().then(
			function() {
				console.log("get session...", cast.framework.CastContext.getInstance().getCurrentSession());
				connectChromeCast();
			},
			function(e){
				console.log('fail to connect...');
			}
		);
	}
	var connectChromeCast = function(){
		var castSession = cast.framework.CastContext.getInstance().getCurrentSession();

		var trackList = [];
		if($("#aniPlayer video track").length > 0 && $("#chromeCastSubYn").prop('checked')){
			var subtitle = {};
			var track = $("#aniPlayer video track").eq(0);
			subtitle = new chrome.cast.media.Track(1/* track ID */, chrome.cast.media.TrackType.TEXT);
			subtitle.trackContentId = 'https://lsh0872.iptime.org:43123/' + $(track).attr('src');
			subtitle.trackContentType = 'text/vtt';
			subtitle.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
			subtitle.name = $(track).attr('label');
			subtitle.language = $(track).attr('srclang');
			subtitle.customData = null;
			trackList.push(subtitle);
		}

		var mediaInfo = new chrome.cast.media.MediaInfo($('#aniPlayer video source').attr('src'));
		mediaInfo.contentType = 'video/mp4';
		mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
		mediaInfo.customData = null;
		mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
		mediaInfo.tracks = trackList;
		mediaInfo.duration = null;
		if(trackList.length > 0){
			mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
			mediaInfo.textTrackStyle.fontFamily = 'Arial';
			//mediaInfo.textTrackStyle.foregroundColor = '#FFFFFF';
			//mediaInfo.textTrackStyle.backgroundColor = '#00000000';
			mediaInfo.textTrackStyle.fontScale = '1.1';
			mediaInfo.textTrackStyle.edgeColor = '#00000099'
			mediaInfo.textTrackStyle.edgeType = chrome.cast.media.TextTrackEdgeType.DROP_SHADOW
		}
		var request = new chrome.cast.media.LoadRequest(mediaInfo);

		if(trackList.length>0){
			request.activeTrackIds = [1];
		}

		castSession.loadMedia(request).then(function(){
			console.log("success..", cast.framework.CastContext.getInstance().getCurrentSession().getMediaSession());
			$("#player")[0].pause();
		}, function(e){
			console.log("fail load media...");
		});
	}
});
