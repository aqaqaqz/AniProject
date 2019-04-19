$(document).ready(function(){
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
});

