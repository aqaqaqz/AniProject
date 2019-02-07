var characterObj = (p)=>{
	var obj;
	var MAX_X = p.MAX_X;
	var MAX_Y = p.MAX_Y;
	var key = {l:false, r:false, u:false, d:false}; 
	var pos = {y:MAX_Y/2+200, x:MAX_X/2, r:8};
	var life = 3;
	var power = 1;
	var speed = 3;

	var keyDown = (e)=>{
		if(e.keyCode == 37) key.l = true;
		if(e.keyCode == 39) key.r = true;
		if(e.keyCode == 38) key.u = true;
		if(e.keyCode == 40) key.d = true;
	}

	var keyUp = (e)=>{
		if(e.keyCode == 37) key.l = false;
		if(e.keyCode == 39) key.r = false;
		if(e.keyCode == 38) key.u = false;
		if(e.keyCode == 40) key.d = false;
	}

	var updatePos = ()=>{
		if(key.l && (pos.x-speed>=0)) pos.x-=speed;
		if(key.r && (pos.x+13+speed<=MAX_X)) pos.x+=speed;
		if(key.u && (pos.y-speed>=0)) pos.y-=speed;
		if(key.d && (pos.y+13+speed<=MAX_Y)) pos.y+=speed;
	}

	var uptPosAndDrawChar = (ship, ctx)=>{
		updatePos();
		ctx.beginPath();
		ctx.drawImage(ship, pos.x, pos.y);
		ctx.fill();
	}

	var init = ()=>{
		key.l = false;
		key.r = false;
		key.u = false;
		key.d = false;
		pos.y = MAX_Y/2+200;
		pos.x = MAX_X/2;
	}

	obj = {keyDown:keyDown, keyUp:keyUp, uptPosAndDrawChar:uptPosAndDrawChar, pos:pos, init:init};

	return obj;
}
