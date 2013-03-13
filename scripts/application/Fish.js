SUBMERSIBLE.Fish = Backbone.Model.extend({

	defaults : function() {
		return {
			//position and movement
			direction : new THREE.Vector3(RANDOM.getFloat(-1, 1), RANDOM.getFloat(-.1, .1), RANDOM.getFloat(-1, 1)),
			position : new THREE.Vector3(RANDOM.getInt(-1000, 1000), RANDOM.getInt(-500, 500), -7000),
			acceleration : 0,
			velocity : 5,
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
			imgSize : 256,
			//a random seed value which will differentiate the fishes movements
			seedValue : RANDOM.getInt(10000),
			//on the screen?
			visible : false,
		}
	},
	initialize : function(attributes, options) {
		//paddle function and sound function are passed in through options
		if(options && options.swim) {
			this.swim = options.swim;
		}
		//the view
		this.view = new SUBMERSIBLE.Fish.View({
			model : this,
		})
	},
	update : function(timestep, time) {
		var rate = this.get("rate");
		this.move(timestep*rate);
		//make the ramp from the time and gate
		var period = this.get("gate") * 1000;
		//augment it by the rate
		period /= rate;
		var ramp = (time + this.get("seedValue")) % period;
		//make it between 0 - 1;
		ramp = ramp / period;
		this.swim(ramp);
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
		var moveAmount = (this.get("velocity") + this.get("acceleration")) * step
		direction.multiplyScalar(moveAmount);
		//update the position
		position.add(direction);
		this.trigger("change:position");
		//move the submarine forward
		position.add(new THREE.Vector3(0, 0, 10 * step));
		//if the object is off the screen, make it invisible
		if(Math.abs(position.x) > 1500 || Math.abs(position.y) > 1500 || Math.abs(position.z) > 1500) {
			this.set("visible", false);
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
		var image = THREE.ImageUtils.loadTexture("./images/" + this.model.get("image"), new THREE.UVMapping(), function() {
			var material = new THREE.MeshBasicMaterial({
				map : image,
				transparent : true,
				side : THREE.DoubleSide,
				overdraw : true,
			})
			var size = self.model.get("imgSize");
			self.sprite = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
			SUBMERSIBLE.scene.add(self.sprite);
			//render for the first time
			self.render(self.model);
		});
	},
	render : function(model) {
		if(this.sprite) {
			this.sprite.position = this.model.get("position");
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
			if((theta > quarterPI && theta < 3 * quarterPI) || (theta < -quarterPI && theta > -3 * quarterPI)) {
				//console.log("too close");
				var theta = Math.round(theta, quarterPI);
			}
			this.sprite.rotation.y = theta + this.model.get("yaw");
			//add the translations
			this.sprite.translateZ(this.model.get("horizontal"));
			this.sprite.translateY(this.model.get("vertical"));
		}
	}
});
