var bulletObj = (p)=>{
	var obj;
	var MAX_Y = p.MAX_Y;
	var MAX_X= p.MAX_X;
	var bullet = {
		pos : {x:0, y:0},	//좌표
		vec : {x:0, y:0},	//벡터
		cir : {x:0, y:0},	//회전
		r : 0,				//반경
		vr : 0,				//변화반경
		angle : 0,			//각도
		angleRate : 0,		//변화각도
		type : 0,			//총알타입
		speed : 4,			//속도
		size : 2			//총알크기
	}
	var level = 1;
	var maxLevel = 3;

	var shotAngle = 0;
	var shotAngleRate = 0.2;
	
	var bulletList = [];

	var updatePos = ()=>{
		for(var i=0;i<bulletList.length;i++){
			var b = bulletList[i];
			if(!checkValid(b)){
				bulletList.splice(i, 1);
				i--;
			}else{
				if(b.type == 1 || b.type == 2){
					b.pos.x += b.vec.x;
					b.pos.y += b.vec.y;
				}else if(b.type == 3){
					b.angle += b.angleRate;
					b.r += b.vr*(parseInt(Math.random()*2)==0?1:-1);

					b.pos.x += b.cir.x + b.r*Math.cos(b.angle);
					b.pos.y += b.cir.y + b.r*Math.sin(b.angle);

					b.vec.x = -b.r*b.angle*Math.sin(b.angle);
					b.vec.y = -b.r*b.angle*Math.cos(b.angle);
				}
			}
		};
	}

	var createBullet = (p, c)=>{
		/*
			1 : circle
			2 : direct to ship
			3 : random
		*/

		if(level > 0){
			var b = deepClone(bullet);
			b.pos.x = p.x; 	b.pos.y = p.y;
			b.type = 1;
			b.vec.x = Math.sin(shotAngle)*Math.sqrt(b.speed);
			b.vec.y = Math.cos(shotAngle)*Math.sqrt(b.speed);

			shotAngle += shotAngleRate;
			bulletList.push(b);
		}
		
		if(level > 1){
			var b2 = deepClone(bullet);
			b2.pos.x = p.x; 	b2.pos.y = p.y;
			b2.type = 2;
			b2.vec.x = c.pos.x-p.x;	
			b2.vec.y = c.pos.y-p.y;

			var temp = Math.sqrt(b2.vec.x*b2.vec.x + b2.vec.y*b2.vec.y);
			b2.vec.x /= temp;
			b2.vec.y /= temp;
			b2.vec.x *= Math.sqrt(b2.speed);
			b2.vec.y *= Math.sqrt(b2.speed);
		
			bulletList.push(b2);
		}	

		if(level > 2){
			var b3 = deepClone(bullet);
			b3.pos.x = p.x; 	b3.pos.y = p.y;
			b3.type = 3;

			b3.vec.x = 0;	b3.vec.y = 0;
			b3.cir.x = Math.random()*(parseInt(Math.random()*2)!=0?1:-1);
			b3.cir.y = Math.random()*(parseInt(Math.random()*2)!=0?1:-1);
			b3.r = 1;		b3.vr = 0.005;
			b3.angle = 0;	b3.angleRate = 0.05;

			bulletList.push(b3);
		}
		
	}

	var uptPosAndDrawBullet = (ctx)=>{
		updatePos();
		
		$.each(bulletList, function(idx, b){
			ctx.beginPath();
			ctx.fillStyle = "white";
			ctx.arc(b.pos.x, b.pos.y, b.size, 0, 2*Math.PI);
			ctx.fill();
		});
	}

	var checkValid = (b)=>{
		if(b.type == 1 || b.type == 2 || b.type == 3){
			if(b.pos.x>0 && b.pos.x<MAX_X && b.pos.y>0 && b.pos.y<MAX_Y) return true;
			return false;
		}
	}

	var crashCheck = (c)=>{
		var result = false;
		var cr = c.pos.r;
		var cx = c.pos.x + cr/2+1;
		var cy = c.pos.y + cr/2+4;

		$.each(bulletList, function(idx, b){
			var tx = b.pos.x-cx;
			var ty = b.pos.y-cy;
			var tr = cr+b.size;
			if( tx*tx + ty*ty  < tr*tr ){
				result = true;
				return false;
			}
		});
		return result;
	}

	var deepClone = (obj)=>{ 
		var objectClone = new obj.constructor(); 
		for (var p in obj) {
			if (typeof obj[p] == 'object') 
				objectClone[p] = deepClone(obj[p]); 
			else 
				objectClone[p] = obj[p]; 
		}
		return objectClone; 
	};

	var levelUp = ()=>{
		level++;
		console.log(level);
	}

	var init = ()=>{
		bulletList = [];
		level = 1;
	}

	obj = {uptPosAndDrawBullet : uptPosAndDrawBullet, createBullet:createBullet, crashCheck:crashCheck, levelUp:levelUp, init:init};

	return obj;
}
