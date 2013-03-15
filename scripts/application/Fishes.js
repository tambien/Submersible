/*
 * ALL THE FISH
 */
SUBMERSIBLE.Fishes = [{
	name : "simpleFish",
	count : 100,
	attributes : {
		//specs
		size : 80, 
		mass : 3,
		speed : 8,
		image : "littleFish.png",
		//the palegic zone 0 - 2
		palegicZone : 0,
		//the length of the swim stroke in seconds
		gate : .5,
	},
	options : {
		swim : function(ramp) {
			//the yaw
			var yaw = INTERPOLATE.sinusoidal(ramp, 0, 1, -.05, .05);
			this.set("yaw", yaw);
			//also bobs side to side with a different offset
			var swayRamp = (ramp + .95) % 1;
			var sway = INTERPOLATE.sinusoidal(swayRamp, 0, 1, .5, -.5);
			this.set("horizontal", sway);
		},
	}
}, {
	name : "jellyFishOne",
	count : 10,
	attributes : {
		//specs
		size : 200, 
		mass : 5,
		speed : 1,
		image : "jelly0.png",
		//the palegic zone 0 - 2 
		palegicZone : 1,
		//the length of the swim stroke in seconds
		gate : 4,
	},
	options : {
		swim : function(ramp) {
			//the yaw
			//var yaw = INTERPOLATE.sinusoidal(ramp, 0, 1, -.05, .05);
			//this.set("yaw", yaw);
			//also bobs side to side with a different offset
			var swayRamp = (ramp + .95) % 1;
			var sway = INTERPOLATE.sinusoidal(swayRamp, 0, 1, .5, -.5);
			this.set("vertical", sway);
		},
	}
}, {
	name : "anglerfish",
	count : 10,
	attributes : {
		//specs
		size : 150, 
		mass : 10,
		speed : 3,
		//images
		image : "angler.png",
		gifCount : 3,
		gifDuration : 500,
		//the palegic zone 0 - 2
		palegicZone : 2,
		//the length of the swim stroke in seconds
		gate : 1.5,
	},
	options : {
		swim : function(ramp) {
			//the yaw
			var pitchRamp = (ramp + .5) % 1;
			var pitch = INTERPOLATE.sinusoidal(pitchRamp, 0, 1, 0, .1);
			this.set("pitch", pitch);
			//also bobs side to side with a different offset
			var swayRamp = (ramp + .0) % 1;
			var sway = INTERPOLATE.sinusoidal(swayRamp, 0, 1, -.2, .2);
			this.set("vertical", sway);
		},
	}
}];
