export function ai_system(entMan){
  for (let entity of entMan.get_with(['ai'])) {
    let ai = entity.ai;
    if (ai.state === 'violent'){
      if ('target' in ai){
        engage(entity, entMan);
      }
    }
  }
};

function engage (owner, deltaTime, target){
		var cos;
		var sin;
		if(true){
			var playerDistance = Math.sqrt( Math.pow(playership.x - this.x, 2) + Math.pow(playership.y - this.y, 2));
			var playerAngle = Math.atan2(playership.y - this.y, playership.x - this.x) - this.spinState;

			if(playerAngle > arc){
				playerAngle -= arc;
			}
			if(playerAngle < -arc){
				playerAngle += arc;
			}
			/*
			roidsGame.context.fillStyle = 'white';
			roidsGame.context.fillText(playerAngle, 10, 10);
			
			roidsGame.context.fillStyle = 'black';
			*/
			
			if(playerAngle > .01){
				this.spinState += this.spinSpeed * deltaTime;
				if(this.spinState > arc){
					this.spinState -= arc;
				}
			}
			if(playerAngle < -.01){
				this.spinState -= this.spinSpeed * deltaTime;
				if(this.spinState < 0){
					this.spinState += arc;
				}
			}
			var dir = Math.atan2(this.vy, this.vx);
			if(playerDistance > 50 &&  (playerAngle < .25 || playerAngle > -.25)){
				//This is boilerplate acceleration code
				this.vx += Math.cos( this.spinState) * deltaTime * this.accel;
				this.vy += Math.sin( this.spinState) * deltaTime * this.accel;
				dir = Math.atan2(this.vy, this.vx);
				//Enforce max speed
				
				if(Math.sqrt( (this.vx * this.vx) + (this.vy * this.vy ) ) > this.maxSpeed){
					//Find current heading vector
					
					
					//Then set to max speed at that heading
					this.vx = Math.cos(dir) * this.maxSpeed;
					this.vy = Math.sin(dir) * this.maxSpeed;
				}
			}
			if (this.shotTimer > 0){
				this.shotTimer -= deltaTime;
				if(this.shotTimer < 0){
					this.shotTimer = 0;
				}
			} else {
				if(playerDistance > 40 &&  (playerAngle < .2 || playerAngle > -.2)){
					var cos = Math.cos(this.spinState);
					var sin = Math.sin(this.spinState); 
					//gameObjects.push(roidsGame.makeShot(this.x + (cos * 12), this.y + (sin * 12), 
					this.vx +(cos * 100),
					this.vy +(sin * 100),
					this.spinState));
					this.shotTimer = this.shotCoolDown;
				}
			}
		}
		
		
		this.x += this.vx * deltaTime;
		this.y += this.vy * deltaTime;
		
};
