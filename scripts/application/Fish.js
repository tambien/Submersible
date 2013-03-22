SUBMERSIBLE.Fish = Backbone.Model.extend({

	defaults : function() {
		//position based on the direction
		var fifthPi = Math.PI / 5;
		var randTheta = RANDOM.getFloat(fifthPi);
		var randPhi = RANDOM.getFloat(-fifthPi / 2, fifthPi / 2);
		var seedValue = RANDOM.getInt(10000);
		return {
			//fish attributes
			size : 80, //in cm
			mass : 15, //in kg
			speed : 3, //in km/h
			//the fish's direction
			theta : randTheta,
			//theta : 0,
			phi : randPhi,
			//position and movement
			direction : new THREE.Vector3(0, 0, 0),
			position : new THREE.Vector3(RANDOM.getInt(-1000, 1000), RANDOM.getInt(-500, 500), -10000),
			//the pitch and yaw of the fish as they swim, DEPRECATE
			yaw : 0,
			pitch : 0,
			horizontal : 0,
			vertical : 0,
			//the opacity multiplier for a pulsing motion
			opacity : 1,
			//the length of a swim stroke in seconds at normal rate
			gate : 2,
			//the palegic zone the fish give a min and max palegic zone
			palegicZone : [0, 0],
			//looks
			color : new THREE.Color(0xffffff),
			image : "littleFish.png",
			//if the object is in the foreground or background
			foreground : RANDOM.flipCoin(),
			//a random seed value which will differentiate the fishes movements
			seedValue : seedValue,
			//on the screen?
			visible : false,
			//for gif'ing a png
			gifCount : 1,
			//DEPRECATED, use subdivision instead
			gifDuration : 200,
			//music parameters
			audible : false,
			offbeat : seedValue % 2 === 0,
			subdivision : "4n",
		}
	},
	initialize : function(attributes, options) {
		//paddle function and sound function are passed in through options
		if(options && options.swim) {
			this.swim = options.swim;
		}
		//set the position and direction
		this.putOnScreen();
		this.getDirectionVectorFromAngles();
		//listen to the subdivision for updates
		var changeString = "change:" + this.get("subdivision");
		this.listenTo(SUBMERSIBLE.metronome, changeString, this.beat);
		//the view
		this.view = new SUBMERSIBLE.Fish.View({
			model : this,
		});
	},
	//ADD/REMOVE FISH//////////////////////////////////////////////////////////
	//sets the direction vectors as well based on the position
	putOnScreen : function() {
		//either put it way back
		var zoneDiff = SUBMERSIBLE.model.get("zoneDifference");
		var zoneMin = -(this.get("palegicZone")[0] * SUBMERSIBLE.model.get("zoneDifference")) - zoneDiff / 4;
		var zoneMax = -(this.get("palegicZone")[1] * SUBMERSIBLE.model.get("zoneDifference")) + zoneDiff / 4;
		var yPos = RANDOM.getInt(zoneMin, zoneMax);

		if(this.get("foreground")) {
			//either coming from the right or left side
			if(RANDOM.flipCoin()) {
				//going right from the left side
				this.set("position", new THREE.Vector3(-1400, yPos, RANDOM.getInt(-4000, -1000)));
			} else {
				this.set("position", new THREE.Vector3(1400, yPos, RANDOM.getInt(-4000, -1000)));
				this.set("theta", Math.PI - this.get("theta"));
			}
			//foreground fish can also be swimming away from the submersible
			if(RANDOM.flipCoin()) {
				this.set("theta", -this.get("theta"));
			}
		} else {
			this.set("position", new THREE.Vector3(RANDOM.getInt(-2400, 2400), yPos, -10001));
			//could be swimming left or right
			if(RANDOM.flipCoin()) {
				this.set("theta", Math.PI - this.get("theta"));
			}
		}
	},
	//converts the speed, theta and phi into a vector
	getDirectionVectorFromAngles : function() {
		//polar to cartesian
		var r = this.get("speed") * (SUBMERSIBLE.metronome.subdivisionToMilliseconds(this.get("subdivision")) / 16);
		var q = this.get("theta");
		var f = this.get("phi");
		var cosQ = Math.cos(q);
		var z = r * cosQ * Math.cos(f);
		var y = r * cosQ * Math.sin(f);
		var x = r * cosQ;
		//the direction vector
		var direction = new THREE.Vector3(x, y, z);
		this.set("direction", direction);
	},
	//removes the model from the collection, makes it inaudible, and removes the sprite
	remove : function() {
		//stop listening
		this.stopListening();
		this.collection.remove(this);
		this.view.remove();
		this.set("audible", false);
	},
	//UPDATE FUNCTIONS/////////////////////////////////////////////////////////
	update : function(timestep, scalar, time) {
		//var rate = this.get("rate");
		//move the fish
		this.move(scalar);
		//see if it's moved off screen
		this.testOffScreen();
		//make the ramp from the time and gate
		var period = this.get("gate") * 1000;
		//augment it by the rate
		//period /= rate;
		var ramp = (time + this.get("seedValue")) % period;
		//make it between 0 - 1;
		ramp = ramp / period;
		this.swim(ramp);
		//update the gif
		if(this.view.gif) {
			this.view.gif.update(this.get("seedValue"));
		}
	},
	moveSubmersible : function(scalar) {
		var pos = this.get('position');
		pos.z += SUBMERSIBLE.model.get("speed") * scalar;
	},
	//called on every beat
	beat : function(metronome, beatNum, delayTime) {
		var offbeat = this.get("offbeat") ? 1 : 0;
		if(beatNum % 2 === offbeat) {
			//this.randomChange(SUBMERSIBLE.metronome.subdivisionToMilliseconds(this.get("subdivision")));
			setTimeout(function(self) {
				self.move();
				self.testOffScreen();
				//update the gif
				if(self.view.gif) {
					self.view.gif.update(self.get("seedValue"));
				}
			}, delayTime, this);
		}
	},
	//called when the fish is on the screen
	//t is a ramp between 0 - 1 of the duration of the gate
	swim : function(ramp) {

	},
	move : function(step) {
		var beatDuration = SUBMERSIBLE.metronome.subdivisionToMilliseconds(this.get("subdivision"));
		var pos = this.get('position');
		pos.add(this.get('direction'));
		//pos.z += SUBMERSIBLE.model.get("speed") * beatDuration / 16;
	},
	//test if it needs to be invisible
	testOffScreen : function() {
		var position = this.get('position');
		if(position.x > 4000 || position.x < -4000) {
			this.remove();
		} else if(position.z > 1200 || position.z < -10000) {
			this.remove();
		}
		//test if it's in the camera view to set the audibility
		if(SUBMERSIBLE.offscreenTest(this.view.sprite)) {
			this.set("audible", false);
		} else {
			this.set("audible", true);
		}
	},
	randomChange : function(step) {
		//once a second approximately
		var onceAsecond = 1 / 1000;
		if(RANDOM.getFloat() < (onceAsecond * step)) {
			//rotate the phi and theta to a new angle
			var fifthPi = Math.PI / 5;
			this.set("theta", RANDOM.getFloat(fifthPi));
			this.set("phi", RANDOM.getFloat(-fifthPi / 2, fifthPi / 2));
			if(this.get('foreground')) {
				//foreground fish can also be swimming away from the submersible
				if(RANDOM.flipCoin()) {
					this.set("theta", -this.get("theta"));
				}
			}
			//either coming from the right or left side
			if(RANDOM.flipCoin()) {
				//going right from the left side
				this.set("position", new THREE.Vector3(-1400, yPos, RANDOM.getInt(-4000, -1000)));
			} else {
				this.set("position", new THREE.Vector3(1400, yPos, RANDOM.getInt(-4000, -1000)));
				this.set("theta", Math.PI - this.get("theta"));
			}
			this.getDirectionVectorFromAngles();
		}
	},
	//make the sound of the fish
	sound : function() {

	}
});

SUBMERSIBLE.Fish.View = Backbone.View.extend({

	initialize : function() {
		//make the sprite
		var self = this;
		//get the gif info
		var gifCount = this.model.get('gifCount');
		var image = THREE.ImageUtils.loadTexture("./images/" + this.model.get("image"), new THREE.UVMapping(), function() {
			image.needsUpdate = true
			if(gifCount > 1) {
				self.gif = new TextureAnimator(image, gifCount, 1, gifCount);
			}
			var material = new THREE.MeshBasicMaterial({
				map : image,
				transparent : true,
				side : THREE.DoubleSide,
				overdraw : true,
				//blending : THREE.AdditiveAlphaBlending,
			})
			var size = self.model.get("size");
			self.sprite = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
			//self.sprite.dynamic = true
			SUBMERSIBLE.scene.add(self.sprite);
			//render for the first time
			self.positionFish(self.model);
			//listen for changes
			//fade the sprite in on the beat
			var changeString = "change:" + self.model.get("subdivision");
			self.listenTo(SUBMERSIBLE.metronome, changeString, self.beat);
		});
	},
	positionFish : function(model) {
		if(this.sprite) {
			var position = this.model.get("position");
			this.sprite.position = position;
			var theta = model.get("theta");
			this.sprite.rotation.y = theta;
			//if it's moving left, flip the phi
			var phi = model.get("phi");
			var direction = this.model.get("direction");
			if(direction.x < 0) {
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
	},
	//called on every beat
	beat : function(metronome, beatNum, delayTime) {
		var offbeat = this.model.get("offbeat") ? 1 : 0;
		var beatDuration = SUBMERSIBLE.metronome.subdivisionToMilliseconds(this.model.get("subdivision"));
		var fadeTime = beatDuration / 3;
		var material = this.sprite.material;
		var position = this.model.get("position");
		var maxOpacity = INTERPOLATE.linear(position.z, -10000, -5000, 0, 1, true);
		//cancel the previous tween
		if(this.fadeTween) {
			this.fadeTween.stop();
		}
		if(beatNum % 2 === offbeat) {
			this.fadeTween = new TWEEN.Tween({
				opacity : 0
			}).to({
				opacity : maxOpacity
			}, fadeTime).delay(delayTime).easing(TWEEN.Easing.Linear.None).onUpdate(function() {
				material.opacity = this.opacity;
			}).start();
		} else {
			//on the offbeat, fade the fish out
			this.fadeTween = new TWEEN.Tween({
				opacity : material.opacity
			}).to({
				opacity : 0
			}, fadeTime).delay(delayTime + beatDuration - fadeTime * 2).easing(TWEEN.Easing.Linear.None).onUpdate(function() {
				material.opacity = this.opacity;
			}).start();
		}
	},
	//when removed from the collection
	remove : function(model) {
		//remove the sprite from the scene
		this.stopListening();
		SUBMERSIBLE.scene.remove(this.sprite);
		//cancel the tween
		if(this.fadeTween) {
			this.fadeTween.stop();
		}
	}
});
/*
 * TEXTURE ANIMATOR FROM https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Texture-Animation.html
 */
function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles) {
	// note: texture passed by reference, will be updated by the update function.

	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet.
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;

	this.update = function(seedValue) {
		this.currentTile++;
		if(this.currentTile == this.numberOfTiles)
			this.currentTile = 0;
		var currentColumn = (this.currentTile + seedValue) % this.tilesHorizontal;
		texture.offset.x = currentColumn / this.tilesHorizontal;
		var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
		texture.offset.y = currentRow / this.tilesVertical;
		texture.needsUpdate = true;
	};
}