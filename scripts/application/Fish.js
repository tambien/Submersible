SUBMERSIBLE.Fish = Backbone.Model.extend({

	defaults : function() {
		//the direction it's travelling in
		var randomXDirection = RANDOM.getFloat(0.2, 1);
		//randomly flip x
		if(RANDOM.flipCoin()) {
			randomXDirection = -randomXDirection;
		}
		//position based on the direction

		return {
			//fish attributes
			size : 80, //in cm
			mass : 15, //in kg
			speed : 3, //in km/h
			//position and movement
			direction : new THREE.Vector3(randomXDirection, RANDOM.getFloat(-.1, .1), .3),
			position : new THREE.Vector3(RANDOM.getInt(-1000, 1000), RANDOM.getInt(-500, 500), -10000),
			acceleration : 0,
			//the speed multiplier
			rate : 1,
			//the pitch and yaw of the fish
			yaw : 0,
			pitch : 0,
			horizontal : 0,
			vertical : 0,
			//the length of a swim stroke in seconds at normal rate
			gate : 2,
			//the palegic zone the fish
			palegicZone : 0,
			//looks
			color : new THREE.Color(0xffffff),
			image : "littleFish.png",
			//a random seed value which will differentiate the fishes movements
			seedValue : RANDOM.getInt(10000),
			//on the screen?
			visible : false,
			//for gif'ing a png
			gifCount : 1,
			gifDuration : 200,
		}
	},
	initialize : function(attributes, options) {
		//paddle function and sound function are passed in through options
		if(options && options.swim) {
			this.swim = options.swim;
		}
		this.on("change:visible", this.putOnScreen);
		//the view
		this.view = new SUBMERSIBLE.Fish.View({
			model : this,
		})
	},
	//ADD TO SCREEN////////////////////////////////////////////////////////////
	putOnScreen : function(model, visible) {
		if(visible) {
			//either put it way back
			var zonePos = -(this.get("palegicZone") * SUBMERSIBLE.model.get("zoneDifference"));
			var dir = this.get("direction");
			var posZ = RANDOM.getInt(-10000, -1000);
			//everything else is based on the z position
			var randY = INTERPOLATE.linear(posZ, -10000, -1000, 2000, 100);
			var randX =  INTERPOLATE.linear(posZ, -10000, -1000, 500, 3000);
			//if(RANDOM.flipCoin()) {
			this.set("position", new THREE.Vector3(RANDOM.getInt(-randX, randX), RANDOM.getInt(-randY, randY) + zonePos, posZ));
			dir.setZ(INTERPOLATE.linear(posZ, -10000, -1000, .35, .01));
			//} else {
			//or on the side

			/*
			 if (RANDOM.flipCoin()){
			 //going left from teh right side
			 this.set("position", new THREE.Vector3(2000, RANDOM.getInt(-100, 100) + zonePos, ));
			 dir.setX(RANDOM.getFloat(-0.2, -1))
			 } else {
			 //going right from the left side
			 this.set("position", new THREE.Vector3(-2000, RANDOM.getInt(-100, 100) + zonePos, RANDOM.getInt(-2000, -1000)));
			 dir.setX(RANDOM.getFloat(0.2, 1))
			 }
			 dir.setZ(.1);
			 }
			 */
		}
	},
	//UPDATE FUNCTIONS/////////////////////////////////////////////////////////
	update : function(timestep, scalar, time) {
		var rate = this.get("rate");
		this.move(scalar * rate);
		//make the ramp from the time and gate
		var period = this.get("gate") * 1000;
		//augment it by the rate
		period /= rate;
		var ramp = (time + this.get("seedValue")) % period;
		//make it between 0 - 1;
		ramp = ramp / period;
		this.swim(ramp);
		//update the gif
		if(this.view.gif) {
			this.view.gif.update(timestep, this.get("seedValue"));
		}
	},
	//called when the fish is on the screen
	//t is a ramp between 0 - 1 of the duration of the gate
	swim : function(ramp) {
		//the yaw
		var yaw = INTERPOLATE.sinusoidal(ramp, 0, 1, -.07, .07);
		this.set("yaw", yaw);
		//also bobs side to side with a different offset
		var swayRamp = (ramp + .95) % 1;
		var sway = INTERPOLATE.sinusoidal(swayRamp, 0, 1, .5, -.5);
		this.set("horizontal", sway);
	},
	//move towards the direction
	move : function(step) {
		var position = this.get("position");
		var direction = this.get("direction").clone().normalize();
		var acceleration = this.get('acceleration');
		var moveAmount = (this.get("speed") + acceleration) * step
		//update acceleration
		if(acceleration < .05) {
			acceleration = 0;
		} else {
			acceleration *= .5;
		}
		this.set('acceleration', acceleration);
		//move in the direction
		direction.multiplyScalar(moveAmount);
		//update the position
		position.add(direction);
		this.trigger("change:position");
		//move the submarine forward
		position.add(new THREE.Vector3(0, 0, SUBMERSIBLE.model.get("speed") * step));
		//if the object is off the screen, make it invisible
		if(position.z > 1500) {
			this.set("visible", false);
		}
		//with some probability change direction and randomly accelerate
		if(RANDOM.getFloat() > (.9999 / step)) {
			//this.set("acceleration", RANDOM.getFloat(this.get("speed")));
			var changeDirection = new THREE.Vector3(RANDOM.getFloat(-1, 1), RANDOM.getFloat(-.1, .1), 0);
			//divide by the mass
			changeDirection.divideScalar(this.get("mass") * 10);
			this.get("direction").add(changeDirection);
			//this.set("direction", direction)
		}
	},
	//make the sound of the fish
	sound : function() {

	}
});

SUBMERSIBLE.Fish.View = Backbone.View.extend({

	initialize : function() {
		//all of the changes in the view
		var throttledRender = _.throttle(this.render, 10);
		this.listenTo(this.model, "change:yaw", throttledRender);
		this.listenTo(this.model, "change:pitch", throttledRender);
		this.listenTo(this.model, "change:position", throttledRender);
		this.listenTo(this.model, "change:direction", throttledRender);
		//make the sprite
		var self = this;
		//get the gif info
		var gifCount = this.model.get('gifCount');
		var gifDuration = this.model.get("gifDuration");
		var image = THREE.ImageUtils.loadTexture("./images/" + this.model.get("image"), new THREE.UVMapping(), function() {
			image.needsUpdate = true
			if(gifCount > 1) {
				self.gif = new TextureAnimator(image, gifCount, 1, gifCount, gifDuration);
			}
			var material = new THREE.MeshBasicMaterial({
				map : image,
				transparent : true,
				side : THREE.DoubleSide,
				//overdraw : true,
				//wireframeLinewidth: 1000,
				//blending: THREE.AdditiveBlending,

			})
			var size = self.model.get("size");
			self.sprite = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
			//self.sprite.dynamic = true
			SUBMERSIBLE.scene.add(self.sprite);
			//render for the first time
			self.render(self.model);
		});
	},
	render : function(model) {
		if(this.sprite) {
			var position = this.model.get("position");
			//the opacity is tied to the distance
			this.sprite.material.opacity = INTERPOLATE.linear(position.z, -10000, -1000, 0, 1, true);
			this.sprite.position = position
			//get the direction angles
			var directionVector = this.model.get("direction");
			var x = directionVector.x;
			var z = directionVector.y;
			var y = directionVector.z;
			var phi = Math.atan(z / Math.sqrt(x * x + y * y));
			var theta = -Math.atan2(y, x);
			this.sprite.rotation.z = phi + this.model.get("pitch");
			//don't let the fish point directly at the camera
			//maximum reach of pi/4
			var quarterPI = Math.PI / 4;
			if(theta > quarterPI && theta < 3 * quarterPI) {
				theta = Math.min(theta, quarterPI);
				theta = Math.max(theta, 3 * quarterPI);
			} else if(theta < -quarterPI && theta > -3 * quarterPI) {
				theta = Math.min(theta, -3 * quarterPI);
				theta = Math.max(theta, -quarterPI);
			}
			this.sprite.rotation.y = theta + this.model.get("yaw");
			//add the translations
			this.sprite.translateZ(this.model.get("horizontal"));
			this.sprite.translateY(this.model.get("vertical"));
		}
	}
});
/*
 * TEXTURE ANIMATOR FROM https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Texture-Animation.html
 */
function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
	// note: texture passed by reference, will be updated by the update function.

	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet.
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;

	this.update = function(milliSec, seedValue) {
		this.currentDisplayTime += milliSec;
		while(this.currentDisplayTime > this.tileDisplayDuration) {
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if(this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = (this.currentTile + seedValue) % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
			texture.offset.y = currentRow / this.tilesVertical;
			texture.needsUpdate = true;
		}
	};
}