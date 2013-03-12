SUBMERSIBLE.Fish = Backbone.Model.extend({

	defaults : function() {
		return {
			//position and movement
			direction : new THREE.Vector3(-1, 0, 1),
			position : new THREE.Vector3(0, 0, 0),
			acceleration : 0,
			velocity : 1,
			//the pitch and yaw of the fish
			yaw : 0,
			pitch : 0,
			//the length of a swim stroke
			gate : 0,
			//the palegic zone the fish
			palegicZone : 0,
			//looks
			color : new THREE.Color(0xffffff),
			image : "littleFish.png",
			imgSize : 256,
		}
	},
	initialize : function(attributes, options) {
		//paddle function and sound function are passed in through options
		if(options && options.swim) {
			this.paddle = options.swim;
		}
		//the view
		this.view = new SUBMERSIBLE.Fish.View({
			model : this,
		})
	},
	//called when the fish is on the screen
	//t is a sinusoidal value between -1 and 1 of period 'gate'
	swim : function(t) {

	},
	//move towards the direction
	move : function() {
		var position = this.get("position");
		var direction = this.get("direction").clone().normalize();
		direction.multiplyScalar(this.get("velocity"));
		//update the position
		position.add(direction);
		this.trigger("change:position");
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
			this.sprite.rotation.y = theta + this.model.get("yaw");
		}
	}
});
