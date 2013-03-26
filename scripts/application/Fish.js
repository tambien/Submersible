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
			position : new THREE.Vector3(RANDOM.getInt(-1000, 1000), RANDOM.getInt(-500, 500), -5000),
			//the pitch and yaw of the fish as they swim, DEPRECATE
			yaw : 0,
			pitch : 0,
			horizontal : 0,
			vertical : 0,
			//the opacity multiplier for a pulsing motion
			opacity : 1,
			//the length of a swim stroke in milliseconds
			gate : 0,
			//the palegic zone the fish give a min and max palegic zone
			palegicZone : [0, 0],
			//looks
			color : new THREE.Color(0xffffff),
			image : "littleFish.png",
			//these get set in the loader
			imageWidth : 0,
			imageHeight : 0,
			//if the object is in the foreground or background
			foreground : RANDOM.flipCoin(),
			//a random seed value which will differentiate the fishes movements
			seedValue : seedValue,
			//on the screen?
			visible : false,
			//for gif'ing a png
			gifCount : 1,
			//increments the image position for gif-type images
			gifOffset : 0,
			//DEPRECATED, use subdivision instead
			gifDuration : 300,
			//music parameters
			audible : false,
			offbeat : seedValue % 2 === 0,
			subdivision : "4n",
			sound : "silence.mp3"
		}
	},
	initialize : function(attributes, options) {
		//swim function options
		if(options && options.swim) {
			this.swim = options.swim;
		}
		if(options && options.putOnScreen) {
			this.putOnScreen = options.putOnScreen;
		}
		//set the position and direction
		this.putOnScreen();
		this.getDirectionVectorFromAngles();
		//listen to the subdivision for updates
		var changeString = "change:" + this.get("subdivision");
		//this.listenTo(SUBMERSIBLE.metronome, changeString, this.beat);
		//start hte timer
		this.fishTime = 0;
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
		var zoneMin = -(this.get("palegicZone")[0] * SUBMERSIBLE.model.get("zoneDifference")) + zoneDiff / 5;
		var zoneMax = -(this.get("palegicZone")[1] * SUBMERSIBLE.model.get("zoneDifference")) - zoneDiff / 5;
		var yPos = RANDOM.getInt(zoneMin, zoneMax);
		if(this.get("foreground")) {
			//either coming from the right or left side
			if(RANDOM.flipCoin()) {
				//going right from the left side
				this.set("position", new THREE.Vector3(-1500, yPos, RANDOM.getInt(-2000, -1000)));
			} else {
				this.set("position", new THREE.Vector3(1500, yPos, RANDOM.getInt(-2000, -1000)));
				this.set("theta", Math.PI - this.get("theta"));
			}
			//foreground fish can also be swimming away from the submersible
			if(RANDOM.flipCoin()) {
				this.set("theta", -this.get("theta"));
			}
		} else {
			this.set("position", new THREE.Vector3(RANDOM.getInt(-1000, 1000), yPos, -5001));
			//could be swimming left or right
			if(RANDOM.flipCoin()) {
				this.set("theta", Math.PI - this.get("theta"));
			}
		}
	},
	//converts the speed, theta and phi into a vector
	getDirectionVectorFromAngles : function() {
		//polar to cartesian
		var r = this.get("speed")// * (SUBMERSIBLE.metronome.subdivisionToMilliseconds(this.get("subdivision")) / 16);
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
		this.set("audible", false);
		//stop listening
		this.stopListening();
		this.view.remove();
		this.collection.remove(this);
	},
	//UPDATE FUNCTIONS/////////////////////////////////////////////////////////
	update : function(scalar, timestep) {
		var gate = this.get("gate");
		if(gate > 0) {
			this.fishTime += timestep;
			var ramp = (this.fishTime % gate) / gate;
			this.swim(ramp);
		}
		//move the fish
		this.move(scalar)
		//update the gif
		this.view.moveGif(timestep);
		//move the submarine
		this.moveSubmersible(scalar);
		//update the view
		this.view.positionFish(this);
	},
	moveSubmersible : function(scalar) {
		var pos = this.get('position');
		pos.z += SUBMERSIBLE.model.get("speed") * scalar;
	},
	//called on every beat
	beat : function(metronome, beatNum, delayTime) {
		var offbeat = this.get("offbeat") ? 1 : 0;
		if(beatNum % 2 === offbeat) {
			this.testOffScreen();
			//this.randomChange(SUBMERSIBLE.metronome.subdivisionToMilliseconds(this.get("subdivision")));
			//setTimeout(function(self) {
			//this.move();
			//this.testOffScreen();
			//}, delayTime, this);
			//stothis.testOffScreen();
		}
	},
	//called when the fish is on the screen
	//t is a ramp between 0 - 1 of the duration of the gate
	swim : function(ramp) {

	},
	move : function(scalar) {
		var pos = this.get('position');
		var dir = this.get("direction").clone().multiplyScalar(scalar);
		pos.add(dir);
	},
	//test if it needs to be invisible
	testOffScreen : function() {
		var position = this.get('position');
		if(position.x > 5000 || position.x < -5000) {
			this.remove();
		} else if(position.z > 1200 || position.z < -6000) {
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
		//once every 5 seconds approximately
		var onceAsecond = 1 / 5000;
		if(RANDOM.getFloat() < (onceAsecond * step)) {
			//rotate the phi and theta to a new angle
			var fifthPi = Math.PI / 5;
			this.set("phi", RANDOM.getFloat(-fifthPi / 2, fifthPi / 2));
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
		var drawProgram = this.drawImage.bind(this);
		this.sprite = new THREE.Particle(new THREE.ParticleCanvasMaterial({
			color : Math.random() * 0x808080 + 0x808080,
			program : drawProgram,
		}));
		var ratio = this.model.get("imageHeight") / (this.model.get("imageWidth") / this.model.get("gifCount"));
		this.sprite.scale.x = this.model.get("size");
		this.sprite.scale.y = this.model.get("size") * ratio;
		SUBMERSIBLE.scene.add(this.sprite);
		//position the fish initially
		this.positionFish(this.model);
		//setup the gifTime
		this.gifTime = 0;
		//listen to the beat changes
		//var changeString = "change:" + this.model.get("subdivision");
		//this.listenTo(SUBMERSIBLE.metronome, changeString, this.beat);
	},
	//draws the image in the context
	drawImage : function(context) {
		//why do they come out upside down?
		var model = this.model;
		var gifOffset = model.get("gifOffset");
		var gifCount = model.get("gifCount");
		var imageWidth = model.get("imageWidth") / gifCount;
		var imagePosition = gifOffset * imageWidth;

		context.save();
		context.translate(0.5, 0.5);
		var direction = model.get("direction");
		if(direction.x < 0) {
			context.scale(-1, -1);
		} else {
			context.scale(1, -1);
		}
		context.drawImage(model.get("image"), imagePosition, 0, imageWidth, model.get("imageHeight"), 0, 0, 1, 1);
		context.restore();
	},
	positionFish : function(model) {
		if(this.sprite) {
			var position = this.model.get("position");
			this.sprite.position = position;
			var phi = model.get("phi") + model.get("pitch");
			this.sprite.rotation.z = -phi
			this.sprite.rotation.y = model.get("theta");
			//add the translations
			this.sprite.translateZ(this.model.get("horizontal"));
			this.sprite.translateY(this.model.get("vertical"));
			var opacity = INTERPOLATE.linear(position.z, -5000, -1000, 0, 1, true);
			this.sprite.material.opacity = opacity * opacity;
		}
	},
	moveGif : function(timestep) {
		var gifTime = this.gifTime;
		var duration = this.model.get("gifDuration");
		var count = this.model.get("gifCount");
		if(count > 0) {
			gifTime += timestep;
			if(gifTime >= duration) {
				var increment = parseInt(gifTime / duration);
				var gifOffset = this.model.get("gifOffset");
				gifOffset += increment;
				gifOffset = gifOffset % count;
				this.model.set("gifOffset", gifOffset);
			}
			gifTime = gifTime % duration;
			this.gifTime = gifTime;
		}
	},
	//called on every beat
	beat : function(metronome, beatNum, delayTime) {
		var offbeat = this.model.get("offbeat") ? 1 : 0;
		var beatDuration = SUBMERSIBLE.metronome.subdivisionToMilliseconds(this.model.get("subdivision"));
		var fadeTime = beatDuration / 6;
		var material = this.sprite.material;
		var position = this.model.get("position");
		var maxOpacity = INTERPOLATE.linear(position.z, -5000, -1000, 0, 1, true);
		//cancel the previous tween
		/*
		 if(this.fadeTween) {
		 this.fadeTween.stop();
		 }*/
		var onComplete = function() {
			this.model.move();
			//this.moveGif();
		}.bind(this);
		if(beatNum % 2 === offbeat) {
			this.fadeTween = new TWEEN.Tween({
				opacity : 0
			}).to({
				opacity : maxOpacity
			}, fadeTime).delay(delayTime).easing(TWEEN.Easing.Linear.None).onUpdate(function() {
				material.opacity = this.opacity;
			}).start();
		} else {
			var self = this;
			//on the offbeat, fade the fish out
			this.fadeTween = new TWEEN.Tween({
				opacity : material.opacity
			}).to({
				opacity : 0
			}, fadeTime).delay(delayTime + beatDuration - fadeTime * 2).easing(TWEEN.Easing.Linear.None).onUpdate(function() {
				material.opacity = this.opacity;
			}).onComplete(onComplete).start();
		}
	},
	//when removed from the collection
	remove : function(model) {
		//remove the sprite from the scene
		this.stopListening();
		SUBMERSIBLE.scene.remove(this.sprite);
	}
});
