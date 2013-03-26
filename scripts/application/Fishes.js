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
		speed : 10,
		subdivision : "4n",
		image : "littleFish.png",
		//the palegic zone 0 - 2
		palegicZone : [0, 1],
		//the audio file of the fish sound
		sound : "silence.mp3"
	},
}, {
	name : "jellyFishOne",
	//after how many seconds does one appear (on average)?
	probability : 2.5,
	attributes : {
		//specs
		size : 200,
		mass : 5,
		speed : 2,
		subdivision : "2n",
		image : "jelly0.png",
		//the palegic zone 0 - 2
		palegicZone : [0, 2],
		//the length of the swim stroke in seconds
		gate : 4000,
		//the audio file of the fish sound
		sound : "silence.mp3"
	},
	options : {
		swim : function(ramp) {
			var pitch = INTERPOLATE.sinusoidal(ramp, 0, 1, -1, 1);
			//this.set("pitch", pitch);
			this.set("vertical", pitch);
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
		speed : 4,
		subdivision : "4n",
		//images
		image : "angler.png",
		gifCount : 3,
		gifDuration : 450,
		//the palegic zone 0 - 2
		palegicZone : [3, 3],
		//the audio file of the fish sound
		sound : "silence.mp3"
	},
}, {
	name : "shark",
	//after how many seconds does one appear (on average)?
	probability : 2,
	attributes : {
		//specs
		size : 600,
		mass : 100,
		speed : 5,
		subdivision : "4n",
		//images
		image : "crayon-shark-sequence.png",
		gifCount : 6,
		gifDuration : 650,
		//the palegic zone 0 - 3
		palegicZone : [0, 1],
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
		speed : 2,
		subdivision : "2n",
		//images
		image : "ink-jelly-sequence.png",
		gifCount : 6,
		gifDuration : 530,
		//the palegic zone 0 - 3
		palegicZone : [1, 3],
		//the audio file of the fish sound
		sound : "silence.mp3"
	},
	options : {
		swim : function(ramp) {
			var pitch = INTERPOLATE.sinusoidal(ramp, 0, 1, -1, 1);
			//this.set("pitch", pitch);
			this.set("vertical", pitch);
		},
	}
}, {
	name : "simpleFishTwo",
	//after how many seconds does one appear (on average)?
	probability : 1,
	attributes : {
		//specs
		size : 250,
		mass : 20,
		speed : 6,
		subdivision : "8n",
		//images
		image : "crayon-zone1fish-sequence.png",
		gifCount : 6,
		gifDuration : 300,
		//the palegic zone 0 - 3
		palegicZone : [0, 1],
		//the audio file of the fish sound
		sound : "silence.mp3"
	},
}];
