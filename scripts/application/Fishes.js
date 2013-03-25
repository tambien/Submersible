/*
 * ALL THE FISH
 */
SUBMERSIBLE.Fishes = [{
	name : "simpleFish",
	//after how many seconds does one appear (on average)?
	probability : 2,
	attributes : {
		//specs
		size : 80,
		mass : 3,
		speed : 14,
		subdivision : "4n",
		image : "littleFish.png",
		//the palegic zone 0 - 2
		palegicZone : [0, 1],
		//the length of the swim stroke in seconds
		gate : .5,
		//the audio file of the fish sound
		sound : "silence.mp3"
	},
	options : {
		swim : function(ramp) {
			var yaw = INTERPOLATE.sinusoidal(ramp, 0, 1, -.1, .1);
			//this.set("yaw", yaw);
			var opacity = INTERPOLATE.sinusoidal(ramp, 0, 1, 0, 1);
			this.set("opacity", ramp);
		},
	}
}, {
	name : "jellyFishOne",
	//after how many seconds does one appear (on average)?
	probability : 2,
	attributes : {
		//specs
		size : 200,
		mass : 5,
		speed : 1,
		subdivision : "2n",
		image : "jelly0.png",
		//the palegic zone 0 - 2
		palegicZone : [0, 2],
		//the length of the swim stroke in seconds
		gate : 4,
		//the audio file of the fish sound
		sound : "silence.mp3"
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
			var opacity = INTERPOLATE.sinusoidal(ramp, 0, 1, 0, 1);
			this.set("opacity", ramp);
		},
	}
}, {
	name : "anglerfish",
	//after how many seconds does one appear (on average)?
	probability : 3,
	attributes : {
		//specs
		size : 150,
		mass : 10,
		speed : 3,
		subdivision : "4n",
		//images
		image : "angler.png",
		gifCount : 3,
		//the palegic zone 0 - 2
		palegicZone : [3, 3],
		//the length of the swim stroke in seconds
		gate : 1.5,
		//the audio file of the fish sound
		sound : "silence.mp3"
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
			var opacity = INTERPOLATE.sinusoidal(ramp, 0, 1, 0, 1);
			this.set("opacity", ramp);
		},
	}
}, {
	name : "shark",
	//after how many seconds does one appear (on average)?
	probability : 2,
	attributes : {
		//specs
		size : 600,
		mass : 100,
		speed : 22,
		subdivision : "4n",
		//images
		image : "crayon-shark-sequence.png",
		gifCount : 6,
		//the palegic zone 0 - 3
		palegicZone : [0, 2],
		//the length of the swim stroke in seconds
		gate : 1.5,
		//the audio file of the fish sound
		sound : "silence.mp3"
	},
}, {
	name : "jellyTwo",
	//after how many seconds does one appear (on average)?
	probability : 2,
	attributes : {
		//specs
		size : 450,
		mass : 10,
		speed : 3,
		subdivision : "2n",
		//images
		image : "ink-jelly-sequence.png",
		gifCount : 6,
		//the palegic zone 0 - 3
		palegicZone : [0, 3],
		//the length of the swim stroke in seconds
		gate : 1.5,
		//the audio file of the fish sound
		sound : "silence.mp3"
	},
}, {
	name : "simpleFishTwo",
	//after how many seconds does one appear (on average)?
	probability : 1,
	attributes : {
		//specs
		size : 250,
		mass : 20,
		speed : 15,
		subdivision : "8n",
		//images
		image : "crayon-zone1fish-sequence.png",
		gifCount : 6,
		//the palegic zone 0 - 3
		palegicZone : [0, 1],
		//the length of the swim stroke in seconds
		gate : 1.5,
		//the audio file of the fish sound
		sound : "silence.mp3"
	},
}];
