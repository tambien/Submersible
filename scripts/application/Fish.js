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
			beatRepeat : 4,
			volume : 1,
			//sound : "silence.mp3"
		}
	},
	initialize : function(attributes, options) {
		//swim function options
		if(options && options.swim) {
			//this.swim = options.swim;
		}
		//scale up the size
		this.set("size", attributes.size * 1.2);
		//set the position and direction
		//this.putOnScreen();
		//start hte timer
		this.fishTime = 0;
		//the view
		this.view = new SUBMERSIBLE.Fish.View({
			model : this,
		});
		this.sound = new SUBMERSIBLE.Fish.Sound({
			model : this,
		})
		//set the gif offset initially using the seed value so that images
		//put on the screen at the same time, don't have hte same movements
		this.set("gifOffset", this.get("seedValue") % this.get("gifCount"));
		//listen for visibility changes and put the fish on the screen
		this.on("change:visible", this.putOnScreen);
	},
	//ADD/REMOVE FISH//////////////////////////////////////////////////////////
	getScreenWidthFromZ : function(z) {
		var dist = SUBMERSIBLE.camera.position.z - z;
		var vFOV = (Math.PI * SUBMERSIBLE.camera.fov) / 180;
		var aspect = SUBMERSIBLE.camera.aspect;
		var hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);
		var visibleWidth = 2 * Math.tan((hFOV / 2 )) * dist;
		return visibleWidth / 2
	},
	//sets the direction vectors as well based on the position
	putOnScreen : function(model, visible) {
		if(visible) {
			//either put it way back
			var zoneDiff = SUBMERSIBLE.model.get("zoneDifference");
			var currentZone = -SUBMERSIBLE.model.get("zone");
			var zoneMin = currentZone * zoneDiff + zoneDiff / 2;
			var zoneMax = currentZone * zoneDiff - zoneDiff / 2;
			var position = this.get('position');
			position.y = RANDOM.getInt(zoneMin, zoneMax);
			var direction = this.get("direction");
			if(this.get("foreground")) {
				//either coming from the right or left side
				//pick a random z
				var zPos = RANDOM.getInt(-3000, -2000);
				position.z = zPos;
				var halfWidth = this.getScreenWidthFromZ(zPos) + this.get("size");

				if(RANDOM.flipCoin()) {
					position.x = -halfWidth;
					direction.setX(1);
				} else {
					position.x = halfWidth;
					direction.setX(-1);
				}
				direction.setZ(RANDOM.getFloat(-.2, .2));
			} else {
				position.z = -6001;
				var halfWidth = this.getScreenWidthFromZ(position.z) / 2 - this.get("size") * 4;
				position.x = RANDOM.getInt(-halfWidth, halfWidth);
				//could be swimming left or right
				direction.setX(RANDOM.flipCoin() ? -1 : 1);
				direction.setZ(RANDOM.getFloat(.2));
			}
			direction.setY(RANDOM.getFloat(-.1, .1));
			this.getDirectionVectorFromAngles();
			//position the view initially
			this.view.positionFish(this);
		}

	},
	//puts the object in the center of teh screen, useful for when switching palegic zones
	putInCenter : function() {
		var position = this.get('position');
		var zPos = RANDOM.getInt(-6000, -500);
		position.z = zPos;
		var halfWidth = this.getScreenWidthFromZ(zPos) + this.get("size");
		position.x = RANDOM.getInt(-halfWidth, halfWidth);
	},
	//converts the speed, theta and phi into a vector
	getDirectionVectorFromAngles : function() {
		var direction = this.get("direction").normalize().multiplyScalar(this.get("speed"));
		this.set("phi", Math.atan2(direction.y, direction.x));
	},
	//removes the model from the collection, makes it inaudible, and removes the sprite
	remove : function() {
		this.set("audible", false);
		this.set("visible", false);
		//stop listening
		//this.stopListening();
		//this.view.remove();
		//this.sound.remove();
		//this.collection.remove(this);
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
		//this.view.positionFish(this);
	},
	moveSubmersible : function(scalar) {
		var pos = this.get('position');
		pos.z += SUBMERSIBLE.model.get("speed") * scalar;
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
	offscreenTest : function() {
		var position = this.get('position').clone();
		//if it's too far away, remove it
		var screenWidth = this.getScreenWidthFromZ(position.z);
		if(position.z < -6100 || position.z > 100) {
			this.remove();
		} else if(Math.abs(position.x) > (screenWidth + this.get("size") * 2)) {
			this.remove();
		}
		//test if it's in the camera view to set the audibility
		if(SUBMERSIBLE.offscreenTest(this)) {
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
			program : drawProgram,
			overdraw : true,
			useScreenCoordinates : true,
		}));
		var ratio = this.model.get("imageHeight") / (this.model.get("imageWidth") / this.model.get("gifCount"));
		this.sprite.scale.x = this.model.get("size");
		this.sprite.scale.y = this.model.get("size") * ratio;
		//add it to the scene
		SUBMERSIBLE.scene.add(this.sprite);
		this.positionFish(this.model);
		//intially note visible
		this.sprite.visible = false;
		//position the fish initially
		//this.positionFish(this.model);
		//setup the gifOffset based on the seed value
		this.model.set("gifOffset", this.model.get("seedValue") % this.model.get("gifCount"));
		this.gifTime = 0;
		//listen to the beat changes
		//var changeString = "change:" + this.model.get("subdivision");
		//this.listenTo(SUBMERSIBLE.metronome, changeString, this.beat);
		this.listenTo(this.model, "change:visible", this.changeVisible);
	},
	changeVisible : function(model, visible) {
		this.sprite.visible = visible;
	},
	//draws the image in the context
	drawImage : function(context) {
		if(this.model.get("visible")) {
			//why do they come out upside down?
			var model = this.model;
			var gifOffset = model.get("gifOffset");
			var gifCount = model.get("gifCount");
			var imageWidth = model.get("imageWidth") / gifCount;
			var imagePosition = gifOffset * imageWidth;

			context.save();

			var direction = model.get("direction");
			if(direction.x > 0) {
				context.translate(0.5, 0.5);
				context.scale(1, -1);
			}
			context.drawImage(model.get("image"), imagePosition, 0, imageWidth, model.get("imageHeight"), 0, 0, 1, 1);
			context.restore();
		}
	},
	positionFish : function(model) {
		if(this.sprite) {
			var position = this.model.get("position");
			this.sprite.position = position;
			var phi = model.get("phi") + model.get("pitch");
			this.sprite.rotation.z = -phi
			this.sprite.rotation.y = model.get("theta");
			//add the translations
			//this.sprite.translateZ(this.model.get("horizontal"));
			//this.sprite.translateY(this.model.get("vertical"));
			var opacity = INTERPOLATE.linear(position.z, -6000, -2500, 0, 1, true);
			this.sprite.material.opacity = opacity * opacity;
		}
	},
	updateOpacity : function() {
		var position = this.model.get("position");
		var opacity = INTERPOLATE.linear(position.z, -6000, -2500, 0, 1, true);
		this.sprite.material.opacity = opacity// * opacity;
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
		if(beatNum % 2 === offbeat) {
			var sprite = this.sprite;
			this.fadeTween = new TWEEN.Tween({
				scale : sprite.scale.x,
			}).to({
				scale : sprite.scale.x * 2,
			}, 100).delay(delayTime).onComplete(function() {
				sprite.visible = true;
			}).start();
		}
	},
	//when removed from the collection
	remove : function(model) {
		//remove the sprite from the scene
		this.stopListening();
		SUBMERSIBLE.scene.remove(this.sprite);
	}
});

SUBMERSIBLE.Fish.Sound = Backbone.View.extend({

	initialize : function() {
		if(this.model.get("sound")) {
			var context = SUBMERSIBLE.context;
			//make the gain
			this.gain = context.createGainNode();
			this.gain.gain.value = 0;
			//make the panner node
			this.panner = context.createPanner();
			//this.panner.panningModel = 'equalpower';
			//make the lowpass filter
			this.lowpass = context.createBiquadFilter();
			//this.panner.rolloffFactor = 2;
			//connect it up
			//this.source.connect(this.lowpass);
			this.lowpass.connect(this.panner);
			this.panner.connect(this.gain);
			this.gain.connect(SUBMERSIBLE.fishOutput);
			//add the event listeners
			this.listenTo(this.model, "change:audible", this.setVolume);
			//start the fish on the next metro tick
			var address = "/metro/" + this.model.get("subdivision");
			this.router = MSG.route(address, this.beat.bind(this));
			//set the beat count based on the random seed
			//this.beatCount = this.model.get("seedValue") % this.model.get("beatRepeat");
			this.beatCount = 0;
		}
	},
	setVolume : function(model, audible) {
		var now = SUBMERSIBLE.context.currentTime;
		var volume = audible ? model.get("volume") : 0;
		var currentGain = this.gain.gain.value;
		this.gain.gain.cancelScheduledValues(now);
		this.gain.gain.setValueAtTime(currentGain, now);
		this.gain.gain.linearRampToValueAtTime(volume, now + 1);
	},
	start : function(model, beatNum, beatTime) {
		this.model.set("offbeat", beatNum % 2 === 1);
		this.source.noteOn(beatTime);
	},
	beat : function(msg) {
		if(this.beatCount % this.model.get("beatRepeat") === 0) {
			this.playSound(msg.timetag);
		}
		this.beatCount++;
	},
	playSound : function(timetag) {
		if(this.model.get("visible")) {
			//and the source node
			var source = SUBMERSIBLE.context.createBufferSource();
			//set hte buffer
			source.buffer = this.model.get("sound");
			source.loop = false;
			//connect it to the lowpass
			source.connect(this.lowpass);
			source.noteOn(timetag);
		}
	},
	update : function(scalar) {
		if(this.panner) {
			//move the panner node to the current position
			var position = this.model.get("position").clone();
			//set the lowpass freq based on the z
			this.lowpass.frequency.value = INTERPOLATE.logarithmic(position.z, -6000, -2000, 20, 20000, true);
			//scale things properly
			position.divideScalar(1000);
			this.panner.setPosition(position.x, 0, position.z);
		}
	},
	remove : function() {
		//stop the buffer
		MSG.unroute(this.router);
		var now = SUBMERSIBLE.context.currentTime;
		if(this.source) {
			this.source.noteOff(now + 1.2);
		}
	}
});
