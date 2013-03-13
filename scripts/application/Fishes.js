/*
 * ALL THE FISH
 */
SUBMERSIBLE.Fishes = [{
	name : "simpleFish",
	count : 10,
	attributes : {
		image : "littleFish.png",
		//the palegic zone 0 - 4
		palegicZone : 0,
		//the length of the swim stroke in seconds
		gate : 2,
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
		image : "jelly0.png",
		velocity : 2,
		//the palegic zone 0 - 4
		palegicZone : 0,
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
}];
