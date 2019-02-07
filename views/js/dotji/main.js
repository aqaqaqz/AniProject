$(document).ready(function(){
	var MAX_Y = 500;
	var MAX_X = 500;
	var c = characterObj({
		y : MAX_Y/2+200,
		x : MAX_X/2,
		MAX_Y : MAX_Y,
		MAX_X : MAX_X
	});
	var b = bulletObj({
		MAX_Y : MAX_Y,
		MAX_X : MAX_X
	});
	
	var ship = document.getElementById("ship");
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var timer = 0;
	var game;

	function drawBackground(){
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, MAX_X, MAX_Y);
		ctx.fill();
	}
	
	function drawScore(){
		ctx.beginPath();
		ctx.fillStyle = "white";
		ctx.translate(50, 50);
		ctx.font = 20 + "px arial";
		ctx.textBaseline="middle";
		ctx.textAlign="left";
		ctx.fillText("Score : "+timer.toString(), 0, 0);
		ctx.fill();
		ctx.translate(-50, -50);
	}
	
	function update() {
		timer++;
		
		drawBackground(ctx);
		drawScore(ctx);
		c.uptPosAndDrawChar(ship, ctx);
		b.uptPosAndDrawBullet(ctx);

		if(timer%5 == 0) 
			b.createBullet({y:MAX_Y/2, x:MAX_X/2}, c);
		if(timer%500==0) 
			b.levelUp();
		if(b.crashCheck(c)){
			clearInterval(game);
			alert("충돌...");
			timer = 0;
			b.init();
			c.init();
			game = setInterval(update, 15);
		}
	}

	var fnInit = ()=>{
		$("body").keydown(function(e){ c.keyDown(e); });
		$("body").keyup(function(e){ c.keyUp(e) });
		$("#canvas").attr("height", MAX_Y);
		$("#canvas").attr("width", MAX_X);

		game = setInterval(update, 15);
	};
	fnInit();
});
