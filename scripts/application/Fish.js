SUBMERSIBLE.Fish = Backbone.Model.extend({

	defaults : function() {
		//the direction it's travelling in
		var randomXDirection = RANDOM.getFloat(0.2, 1);
		//randomly flip x
		if(RANDOM.flipCoin()) {
			randomXDirection = -randomXDirection;
		}
		//position based on the direction
		var fifthPi = Math.PI / 5;

		return {
			//fish attributes
			size : 80, //in cm
			mass : 15, //in kg
			speed : 3, //in km/h
			//the fish's direction
			theta : RANDOM.or(RANDOM.getFloat(-fifthPi, fifthPi), RANDOM.getFloat(4 * fifthPi, 6 * fifthPi)),
			//theta : 0,
			phi : RANDOM.getFloat(-fifthPi / 2, fifthPi / 2),
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
			//the palegic zone the fish give a min and max palegic zone
			palegicZone : [0, 0],
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
			var zoneDiff = SUBMERSIBLE.model.get("zoneDifference");
			var zoneMin = -(this.get("palegicZone")[0] * SUBMERSIBLE.model.get("zoneDifference")) - zoneDiff / 4;
			var zoneMax = -(this.get("palegicZone")[1] * SUBMERSIBLE.model.get("zoneDifference")) + zoneDiff / 4;
			var zPos = RANDOM.getInt(zoneMin, zoneMax);
			var dir = this.get("direction");

			if(RANDOM.flipCoin()) {
				//going left from teh right side
				this.set("position", new THREE.Vector3(RANDOM.getInt(-2400, 2400), zPos, -9900));
			
			} else {
				//either coming from the right or left side
				if(RANDOM.flipCoin()) {
					//going right from the left side
					this.set("position", new THREE.Vector3(-2400, zPos, RANDOM.getInt(-4000, -1000)));
				} else {
					this.set("position", new THREE.Vector3(2400, zPos, RANDOM.getInt(-4000, -1000)));
				}
			}
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
		var yaw = INTERPOLATE.sinusoidal(ramp, 0, 1, -.05, .05);
		this.set("theta", this.get("theta") + yaw);
		//also bobs side to side with a different offset
		/*
		 var swayRamp = (ramp + .95) % 1;
		 var sway = INTERPOLATE.sinusoidal(swayRamp, 0, 1, .5, -.5);
		 this.set("horizontal", sway);
		 */
	},
	/*
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
	 //make sure they don't leave their zone
	 //if (position.y < )
	 //with some probability change direction and randomly accelerate
	 if(RANDOM.getFloat() > (.9999 / step)) {
	 //this.set("acceleration", RANDOM.getFloat(this.get("speed")));
	 var changeDirection = new THREE.Vector3(RANDOM.getFloat(-1, 1), RANDOM.getFloat(-.1, .1), 0);
	 //divide by the mass
	 changeDirection.divideScalar(this.get("mass"));
	 this.get("direction").add(changeDirection);
	 }
	 },
	 */
	move : function(step) {
		//find the direction vector from theta and phi with a radius of speed
		//polar to cartesian
		var r = this.get("speed");
		var q = this.get("theta") + this.get("yaw");
		var f = this.get("phi") + this.get("pitch");
		var cosQ = Math.cos(q);
		var z = r * cosQ * Math.cos(f);
		var y = r * cosQ * Math.sin(f);
		var x = r * cosQ;
		//the direction vector
		var direction = new THREE.Vector3(x, y, z);
		//add it to the position vector
		var pos = this.get('position');
		pos.add(direction);
		//make sure it's still visible;
		this.testOffScreen();
		//change it's direction if it wanders out of it's palegic zone
		var zoneDiff = SUBMERSIBLE.model.get("zoneDifference");
		var zoneMin = -(this.get("palegicZone")[0] * SUBMERSIBLE.model.get("zoneDifference")) - zoneDiff / 2;
		var zoneMax = -(this.get("palegicZone")[1] * SUBMERSIBLE.model.get("zoneDifference")) + zoneDiff / 2;
		if(pos.y > zoneMax) {
			var phi = this.get("phi");
			//point it upward
			this.set("phi", Math.abs(phi));
		} else if(pos.y < zoneMin) {
			var phi = this.get("phi");
			//point it downward
			this.set("phi", -Math.abs(phi));
		}
		//add a bit of randomness to it
		this.randomChange(step);
		//move the submarine forward
		pos.z -= SUBMERSIBLE.model.get("speed");
	},
	//test if it needs to be invisible
	testOffScreen : function() {
		var position = this.get('position');
		if(position.x > 3000 || position.x < -3000) {
			this.set('visible', false);
		} else if(position.z > 1200 || position.z < -10000) {
			this.set("visible", false);
		}
		/*
		 if (SUBMERSIBLE.offscreenTest(this.view.sprite)){
		 this.set("visible", false);
		 }
		 */
	},
	randomChange : function(step) {
		//once a second approximately
		var onceAsecond = 1 / 1000;
		if(RANDOM.getFloat() < (onceAsecond * step)) {
			//rotate the phi and theta to a new angle
			var fifthPi = Math.PI / 5;
			var randTheta = RANDOM.or(RANDOM.getFloat(-fifthPi, fifthPi), RANDOM.getFloat(4 * fifthPi, 6 * fifthPi));
			var randPhi = RANDOM.getFloat(-fifthPi / 2, fifthPi / 2);
			//get the difference
			var theta = this.get("theta");
			var phi = this.get("phi");
			//divide the differences by the mass
			var mass = this.get("mass");
			//test that it's not going into a not allowed angle
			//divide by the mass so that the change is not so abrupt
			//tween the rotation
			if(this.rotateTween) {
				this.rotateTween.stop();
			}
			var self = this;
			this.rotateTween = new TWEEN.Tween({
				theta : theta,
				phi : phi
			}).to({
				theta : randTheta,
				phi : randPhi,
			}, mass * 100).easing(TWEEN.Easing.Quadratic.Out).onUpdate(function() {
				self.set("theta", this.theta);
				self.set("phi", this.phi);
			}).start();
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
		this.listenTo(this.model, "change:theta", throttledRender);
		this.listenTo(this.model, "change:phi", throttledRender);
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
			this.sprite.position = position;
			var theta = model.get("theta") + model.get("yaw");
			this.sprite.rotation.y = theta;
			//if theta is greater than pi/2, flip phi
			var phi = model.get("phi") + model.get("pitch");
			if(theta > 1.57) {
				phi = -phi;
			}
			this.sprite.rotation.z = phi

			/*
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
			 */
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