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
});

